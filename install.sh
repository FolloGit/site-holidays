#!/bin/sh
# Установить site-holidays в папку статики сайта · Install site-holidays into a site's static folder
#   ./install.sh <папка assets сайта · site assets folder>
# Пример · Example:
#   ./install.sh ../site/assets  →  assets/holidays/site-holidays.js, holidays/*.js, img/*
set -e
DIR=$(cd "$(dirname "$0")" && pwd)
ASSETS="${1:?укажите папку assets сайта · pass the site assets folder, e.g. ../site/assets}"
DEST="$ASSETS/holidays"

# прошлая версия заменяется целиком · the previous version is replaced entirely
rm -rf "$DEST"
mkdir -p "$DEST/holidays" "$DEST/img"
cp "$DIR/site-holidays.js" "$DEST/"
cp "$DIR"/holidays/*.js "$DEST/holidays/"
cp "$DIR"/img/* "$DEST/img/"

VER=$(sed -n "s/.*var VERSION = '\([0-9.]*\)'.*/\1/p" "$DIR/site-holidays.js" | head -1)
echo "site-holidays $VER → $DEST"
echo "Подключение · Include (before </body>):  <script src=\"assets/holidays/site-holidays.js?v=$VER\" defer></script>"
