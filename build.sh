#!/bin/bash

# Remove previous build
echo "cleaning..."
rm -rf ./*.d.ts ./*.js ./*.map ./dist/* ./build/*


# Compile typescript to javascript (configured by tsconfig.json)
echo "compiling typescript..."
npx tsc


# Lint source code
echo "linting source code..."
npx eslint . --ext .js,.ts
