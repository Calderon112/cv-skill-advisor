#!/bin/sh
# Backup of everything CareerAI keeps: Keycloak's accounts and credentials, and the
# application's own database. Both live in the same PostgreSQL container.
#
#   sudo install -m 700 scripts/backup-careerai.sh /usr/local/bin/
#   sudo /usr/local/bin/backup-careerai.sh
#   sudo crontab -e
#     15 3 * * *  /usr/local/bin/backup-careerai.sh >> /var/log/careerai-backup.log 2>&1
#
# Restore:
#   gunzip -c /var/backups/careerai/careerai-<stamp>.sql.gz \
#     | docker exec -i careerai-postgres psql -U keycloak postgres
#
set -eu

DEST=${BACKUP_DIR:-/var/backups/careerai}
KEEP_DAYS=${BACKUP_KEEP_DAYS:-30}
CONTAINER=${POSTGRES_CONTAINER:-careerai-postgres}

# The superuser is whatever POSTGRES_USER was set to. Read it from .env.prod when we
# can find it, so a non-default KC_DB_USER does not silently break the nightly run —
# cron has none of the shell environment the deploy commands run in.
for env_file in \
  "${ENV_FILE:-}" \
  /home/ubuntu/cv-skill-advisor/.env.prod \
  /root/cv-skill-advisor/.env.prod
do
  [ -n "$env_file" ] && [ -r "$env_file" ] || continue
  val=$(sed -n 's/^KC_DB_USER=//p' "$env_file" | head -1 | tr -d '"'"'"' \r')
  [ -n "$val" ] && DB_USER="$val"
  break
done
DB_USER=${DB_USER:-keycloak}

if ! docker inspect "$CONTAINER" >/dev/null 2>&1; then
  echo "backup FAILED: container '$CONTAINER' not found — is the stack running?" >&2
  exit 1
fi

mkdir -p "$DEST"
STAMP=$(date +%F_%H%M)
OUT="$DEST/careerai-$STAMP.sql.gz"

# pg_dumpall, not pg_dump: it takes every database in the cluster AND the roles they
# depend on. A per-database dump restores tables owned by a role that does not exist
# on a fresh server, and fails at the very last step — when you least want it to.
#
# `set -o pipefail` is not POSIX, so check pg_dumpall's own status explicitly:
# without this, a failing dump into a working gzip still exits 0 and writes a valid
# archive of an error message.
if ! docker exec "$CONTAINER" pg_dumpall -U "$DB_USER" > "$DEST/.tmp-$STAMP.sql"; then
  echo "backup FAILED: pg_dumpall returned an error" >&2
  rm -f "$DEST/.tmp-$STAMP.sql"
  exit 1
fi

if [ ! -s "$DEST/.tmp-$STAMP.sql" ]; then
  echo "backup FAILED: the dump is empty" >&2
  rm -f "$DEST/.tmp-$STAMP.sql"
  exit 1
fi

gzip -c "$DEST/.tmp-$STAMP.sql" > "$OUT"
rm -f "$DEST/.tmp-$STAMP.sql"
gzip -t "$OUT"                       # refuse to keep a truncated archive
chmod 600 "$OUT"                     # it contains password hashes

# Sanity check: a dump without the app's tables means the wrong database was reached.
if ! gunzip -c "$OUT" | grep -q 'CREATE ROLE'; then
  echo "backup WARNING: no roles in the dump — check KC_DB_USER is the superuser" >&2
fi

find "$DEST" -name 'careerai-*.sql.gz' -mtime "+$KEEP_DAYS" -delete

echo "backup ok: $OUT ($(du -h "$OUT" | cut -f1))"
