#!/bin/sh
set -e
TEMPLATE="/docker-entrypoint.d/config.template.js"
TARGET="/usr/share/nginx/html/config.js"
if [ -f "$TEMPLATE" ]; then
  echo "Generating runtime config.js with API_BASE_URL=$API_BASE_URL"
  envsubst '${API_BASE_URL}' < "$TEMPLATE" > "$TARGET"
fi
