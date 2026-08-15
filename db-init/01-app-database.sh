#!/bin/bash
# Runs once, the first time the Postgres volume is initialised.
#
# Keycloak and the application share one Postgres server but must not share a
# database: a bug or a bad migration in one should not be able to touch the other's
# tables, and Keycloak owns its schema entirely — it creates and migrates its own
# tables on every upgrade.
#
# The application user therefore gets its own database and no rights on Keycloak's.
set -euo pipefail

APP_DB="${APP_DB_NAME:-careerai}"
APP_USER="${APP_DB_USER:-careerai}"
APP_PASSWORD="${APP_DB_PASSWORD:?APP_DB_PASSWORD must be set}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER ${APP_USER} WITH PASSWORD '${APP_PASSWORD}';
    CREATE DATABASE ${APP_DB} OWNER ${APP_USER};
    -- No grant on the Keycloak database: the app has no business reading identities
    -- out of it, and least privilege is easier to keep when it is the default.
EOSQL

echo "created database ${APP_DB} owned by ${APP_USER}"
