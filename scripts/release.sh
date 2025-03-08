#!/bin/bash

# Exit on error
set -e

# Check if version argument is provided
if [ -z "$1" ]; then
  echo "Error: Version argument is required"
  echo "Usage: ./scripts/release.sh <version>"
  echo "Example: ./scripts/release.sh 1.0.0"
  exit 1
fi

VERSION=$1

# Validate version format
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Version must be in format x.y.z"
  exit 1
fi

# Check if git remote exists
echo "Checking git remote..."
if ! git remote | grep -q "origin"; then
  echo "Error: No 'origin' remote found. Please set up your git remote first."
  echo "Example: git remote add origin https://github.com/yourusername/react-keyhub.git"
  exit 1
fi

# Check if we can push to the remote
echo "Checking remote connection..."
if ! git ls-remote --exit-code origin &>/dev/null; then
  echo "Error: Cannot connect to remote 'origin'. Please check your git configuration and network connection."
  exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working directory is not clean. Please commit or stash changes."
  exit 1
fi

# Run tests
echo "Running tests..."
npm test

# Run type check
echo "Running type check..."
npm run typecheck

# Run lint
echo "Running lint..."
npm run lint

# Build package
echo "Building package..."
npm run build

# Check package size
echo "Checking package size..."
npm run size
npm run check-size

# Update version in package.json
echo "Updating version to $VERSION..."
npm version $VERSION --no-git-tag-version

# Commit changes
echo "Committing changes..."
git add package.json
git commit -m "chore: release v$VERSION"

# Create git tag
echo "Creating git tag v$VERSION..."
git tag -a "v$VERSION" -m "Release v$VERSION"

# Push changes and tag
echo "Pushing changes and tag..."
git push origin main
git push origin "v$VERSION"

echo "Release v$VERSION prepared and pushed."
echo "Now create a release on GitHub to trigger the npm publish workflow." 