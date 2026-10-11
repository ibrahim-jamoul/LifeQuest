#!/bin/sh
set -e
cd "$(dirname "$0")"
echo "LifeQuest V3 - ouvre http://localhost:8000 (mode portrait)"
node tools/serve.mjs
