#!/bin/sh
set -eu

: "${BACKEND_API_URL:=http://unity-backend:3008}"

envsubst '${BACKEND_API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
