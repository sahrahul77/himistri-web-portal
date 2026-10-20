#!/bin/bash

# HiMistri - GitHub Push & Vercel Deployment Script
echo "================================================="
echo "   HiMistri Next.js - GitHub & Vercel Deployer  "
echo "================================================="

if [ -z "$1" ]; then
    echo "Usage: ./deploy_github_vercel.sh <YOUR_GITHUB_REPO_URL>"
    echo "Example: ./deploy_github_vercel.sh https://github.com/yourusername/himistri-web.git"
    exit 1
fi

REPO_URL=$1

echo "1. Initializing Git repository..."
git init
git add .
git commit -m "Deploy HiMistri Next.js Web Portal to Vercel & GitHub"

echo "2. Connecting to GitHub remote ($REPO_URL)..."
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"
git branch -M main

echo "3. Pushing code to GitHub..."
git push -u origin main

echo "================================================="
echo " Success! Code pushed to GitHub."
echo " Next step: Open https://vercel.com/new and import"
echo " your GitHub repository for instant live deployment!"
echo "================================================="
