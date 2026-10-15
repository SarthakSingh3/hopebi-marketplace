#!/bin/sh

# If SPRING_DATASOURCE_URL is supplied by Render without jdbc: prefix, add it
if [ -n "$SPRING_DATASOURCE_URL" ]; then
  case "$SPRING_DATASOURCE_URL" in
    jdbc:*)
      ;;
    postgresql://*)
      SPRING_DATASOURCE_URL="jdbc:$SPRING_DATASOURCE_URL"
      ;;
    postgres://*)
      SPRING_DATASOURCE_URL="jdbc:postgresql://${SPRING_DATASOURCE_URL#postgres://}"
      ;;
  esac
  export SPRING_DATASOURCE_URL
fi

# Fallback: if DB_HOST is present and SPRING_DATASOURCE_URL not set or default
if [ -n "$DB_HOST" ] && [ -z "$SPRING_DATASOURCE_URL" ]; then
  export SPRING_DATASOURCE_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT:-5432}/${DB_NAME:-hopebidb}"
  export SPRING_DATASOURCE_USERNAME="${DB_USER:-hopebi_user}"
  export SPRING_DATASOURCE_PASSWORD="${DB_PASSWORD:-hopebi_pass}"
fi

exec java -Djava.security.egd=file:/dev/./urandom -jar app.jar
