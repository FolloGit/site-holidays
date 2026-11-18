#!/bin/sh
# Копирует плагин ft-winter в папку статики сайта.
#   ./install.sh <папка assets сайта>
# Пример: ./install.sh ../site/assets   →   assets/js/ft-winter.js и assets/img/winter-*.svg
set -e
DIR=$(cd "$(dirname "$0")" && pwd)
DEST="${1:?укажите папку assets сайта, например ../site/assets}"
mkdir -p "$DEST/js" "$DEST/img"
cp "$DIR/js/ft-winter.js" "$DEST/js/ft-winter.js"
cp "$DIR"/img/winter-*.svg "$DEST/img/"
VER=$(sed -n 's/.*ft-winter\.js \([0-9.]*\).*/\1/p' "$DIR/js/ft-winter.js" | head -1)
echo "ft-winter $VER → $DEST"
echo "Подключение перед </body>:  <script src=\"assets/js/ft-winter.js?v=$VER\" defer></script>"
