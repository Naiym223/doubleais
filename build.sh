#!/bin/bash

echo "Starting Netlify build process..."

export NODE_ENV=production
export NEXT_DISABLE_ESLINT=1
export ESLINT_SKIP=true
export NEXT_STATIC_EXPORT=true

rm -rf .next
rm -rf out
rm -rf static_build

npm run build
npx next export -o static_build

echo "Static build completed!"
ls -la static_build/
