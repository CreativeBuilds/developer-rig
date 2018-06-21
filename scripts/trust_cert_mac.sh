#!/usr/bin/env bash
NAME=${1:-testing}

echo "Installing cert into local Keychain."
echo "To see or modify, run 'Keychain Access' app and look in the 'System' Folder"
sudo security add-trusted-cert -d -p ssl -r trustRoot -k "/Library/Keychains/System.keychain" "${NAME}"
