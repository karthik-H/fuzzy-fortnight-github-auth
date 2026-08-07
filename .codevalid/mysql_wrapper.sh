#!/usr/bin/env sh
# URI-aware mysql wrapper installed by seed-test.Dockerfile
# Allows: mysql "mysql://user:pass@host:port/db" -e "SQL"
REAL_MYSQL=/usr/bin/mysql
first="${1:-}"
case "$first" in
  mysql://*|mysql+tcp://*)
    shift
    rest="${first#mysql://}"; rest="${rest#mysql+tcp://}"
    userinfo="${rest%%@*}"; hostpart="${rest#*@}"
    user="${userinfo%%:*}"; pass="${userinfo#*:}"
    hostport="${hostpart%%/*}"; dbname="${hostpart#*/}"
    host="${hostport%%:*}"; port="${hostport#*:}"
    [ "$port" = "$host" ] && port=3306
    exec "$REAL_MYSQL" --protocol=TCP -h"$host" -P"$port" -u"$user" -p"$pass" "$dbname" "$@"
    ;;
  *)
    exec "$REAL_MYSQL" "$@"
    ;;
esac
