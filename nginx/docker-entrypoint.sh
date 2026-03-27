#!/bin/sh
set -e

if [ ! -f /etc/nginx/ssl/cert.pem ]; then
  echo "Generating self-signed SSL certificate..."
  apk add --no-cache openssl
  mkdir -p /etc/nginx/ssl
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/C=TR/ST=Istanbul/L=Istanbul/O=M Dijital/CN=localhost"
  echo "SSL certificate generated"
fi

exec nginx -g 'daemon off;'

