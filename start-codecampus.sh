#!/bin/bash
# CodeCampus startup script with proper Node.js environment
export PATH="/nix/store/0akvkk9k1a7z5vjp34yz6dr91j776jhv-nodejs-20.11.1/bin:$PATH"
cd /home/runner/workspace

# Verify Node.js is available
node --version
npm --version

# Start the development server
npm run dev