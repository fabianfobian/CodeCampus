#!/bin/bash
# Development server script for CodeCampus
export PATH="/nix/store/0akvkk9k1a7z5vjp34yz6dr91j776jhv-nodejs-20.11.1/bin:$PATH"
cd /home/runner/workspace
exec node ./node_modules/tsx/dist/cli.mjs server/index.ts