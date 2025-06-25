#!/bin/bash
# Startup script for CodeCampus project

# Set up Node.js environment from Nix store
export PATH="/nix/store/0akvkk9k1a7z5vjp34yz6dr91j776jhv-nodejs-20.11.1/bin:$PATH"
export NODE_PATH="./node_modules"

echo "Starting CodeCampus server..."
npm run dev