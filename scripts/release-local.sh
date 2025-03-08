#!/bin/bash

# Exit on error
set -e

# Check if version argument is provided
if [ -z "$1" ]; then
  echo "Error: Version argument is required"
  echo "Usage: ./scripts/release-local.sh <version>"
  echo "Example: ./scripts/release-local.sh 1.0.0"
  exit 1
fi

VERSION=$1

# Validate version format
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Version must be in format x.y.z"
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

# Skip lint check for now
echo "Skipping lint check..."
# npm run lint

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

echo "Release v$VERSION prepared locally."
echo "Note: Changes and tag have not been pushed to the remote repository."
echo "To complete the release process, manually push the changes and tag:"
echo "  git push origin master"
echo "  git push origin v$VERSION"
echo "Then create a release on GitHub to trigger the npm publish workflow." 