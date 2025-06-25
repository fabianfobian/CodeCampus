#!/bin/bash
# Set up Node.js environment in PATH
export PATH="/nix/store/0akvkk9k1a7z5vjp34yz6dr91j776jhv-nodejs-20.11.1/bin:$PATH"

# Create symlinks in /usr/local/bin (if writable) or current directory
if [ -w /usr/local/bin ]; then
    ln -sf /nix/store/0akvkk9k1a7z5vjp34yz6dr91j776jhv-nodejs-20.11.1/bin/node /usr/local/bin/node
    ln -sf /nix/store/0akvkk9k1a7z5vjp34yz6dr91j776jhv-nodejs-20.11.1/bin/npm /usr/local/bin/npm
else
    # Create wrapper scripts in current directory
    echo '#!/bin/bash' > node
    echo 'exec /nix/store/0akvkk9k1a7z5vjp34yz6dr91j776jhv-nodejs-20.11.1/bin/node "$@"' >> node
    chmod +x node
    
    echo '#!/bin/bash' > npm
    echo 'exec /nix/store/0akvkk9k1a7z5vjp34yz6dr91j776jhv-nodejs-20.11.1/bin/npm "$@"' >> npm
    chmod +x npm
    
    export PATH="$(pwd):$PATH"
fi

echo "Node.js environment configured successfully"
node --version
npm --version