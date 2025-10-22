#!/bin/bash

echo "Setting environment variables..."

# Set NEXT_PUBLIC_NETWORK to celo_sepolia
echo "celo_sepolia" | npx vercel env add NEXT_PUBLIC_NETWORK

echo "Environment variables set successfully!"
