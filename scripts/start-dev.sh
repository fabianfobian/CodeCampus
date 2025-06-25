#!/bin/bash
# Set up Node.js environment for CodeCampus
export PATH="/nix/store/0akvkk9k1a7z5vjp34yz6dr91j776jhv-nodejs-20.11.1/bin:$PATH"
export NODE_ENV=development

# Start the development server
exec node ./node_modules/tsx/dist/cli.mjs server/index.ts