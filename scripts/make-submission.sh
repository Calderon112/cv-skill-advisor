#!/usr/bin/env bash
#
# make-submission.sh — build the submission archive from git, never from the disk.
#
# The Sprint-3 archive was produced by zipping the working directory. That shipped
# a populated .env with eight live third-party keys and the Keycloak client secret,
# plus storage.json holding 14 real user records and 109 session tokens. Every one
# of those files is correctly listed in .gitignore; the packaging step simply never
# consulted it.
#
# So this script does not filter — filtering is what failed. It exports the commit
# through `git archive`, which can only emit tracked files. An ignored file cannot
# be tracked, so it cannot reach the archive, whatever else is lying in the folder.
#
# It then greps the result for secret shapes anyway and refuses to hand over an
# archive that trips the scan. Two independent controls, because the first one
# already looked sufficient last time.
#
# Usage:  bash scripts/make-submission.sh [ref]      (default: HEAD)

set -euo pipefail

REF="${1:-HEAD}"
NAME="careerai-submission"
OUT="dist/${NAME}.zip"

cd "$(dirname "$0")/.."
mkdir -p dist
rm -f "$OUT"

echo "==> exporting ${REF} through git archive (tracked files only)"
git archive --format=zip --prefix="${NAME}/" -o "$OUT" "$REF"

echo "==> verifying the archive contains no secret"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
unzip -q "$OUT" -d "$TMP"

FAIL=0

# 1. Files that must never appear, whatever their contents.
while IFS= read -r forbidden; do
  if [ -n "$forbidden" ]; then
    echo "    FAIL: forbidden file in archive: $forbidden"
    FAIL=1
  fi
done < <(cd "$TMP" && find . \( -name '.env' -o -name '.env.prod' -o -name 'storage.json' \
           -o -name '*.sqlite' -o -name '.usage-stats.json' \) -not -name '*.example' | sed 's|^\./||')

# 2. Secret shapes, in case a key is ever pasted into a tracked file. The example
#    files legitimately contain the variable NAMES, so match on a value being
#    present after the "=", not on the name alone.
PATTERNS='re_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|AIza[A-Za-z0-9_-]{30,}|(API_KEY|CLIENT_SECRET|APP_KEY|AFFID|TOKEN|PASSWORD)=[A-Za-z0-9][A-Za-z0-9_-]{15,}'
if grep -rEIl "$PATTERNS" "$TMP" 2>/dev/null | grep -v 'node_modules' > "$TMP/.hits"; then
  if [ -s "$TMP/.hits" ]; then
    echo "    FAIL: secret-shaped values found in:"
    sed "s|$TMP/||;s|^|      |" "$TMP/.hits"
    FAIL=1
  fi
fi

if [ "$FAIL" -ne 0 ]; then
  rm -f "$OUT"
  echo "==> archive DELETED — fix the findings above and run again"
  exit 1
fi

COUNT=$(cd "$TMP" && find . -type f | wc -l)
SIZE=$(du -h "$OUT" | cut -f1)
echo "==> OK: ${OUT} (${COUNT} files, ${SIZE}) — no secret detected"
echo "    Contents come from ${REF}; anything untracked was never eligible."
