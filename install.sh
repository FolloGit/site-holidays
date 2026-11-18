#!/bin/sh
# Копирует site-holidays в папку статики сайта.
#   ./install.sh <папка assets сайта>
# Пример: ./install.sh ../site/assets  →  assets/holidays/site-holidays.js, holidays/*.js, img/*
set -e
DIR=$(cd "$(dirname "$0")" && pwd)
ASSETS="${1:?укажите папку assets сайта, например ../site/assets}"
DEST="$ASSETS/holidays"
rm -rf "$DEST"
mkdir -p "$DEST/holidays" "$DEST/img"
cp "$DIR/site-holidays.js" "$DEST/"
cp "$DIR"/holidays/*.js "$DEST/holidays/"
cp "$DIR"/img/* "$DEST/img/"
VER=$(sed -n "s/.*var VERSION = '\([0-9.]*\)'.*/\1/p" "$DIR/site-holidays.js" | head -1)
echo "site-holidays $VER → $DEST"
echo "Подключение перед </body>:  <script src=\"assets/holidays/site-holidays.js?v=$VER\" defer></script>"
