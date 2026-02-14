#!/usr/bin/env bash
set -euo pipefail

# Synchronized version bump for all publishable packages
# Usage: ./scripts/version.sh <patch|minor|major|x.y.z>

PACKAGES=(virtual-router data-router)
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ $# -ne 1 ]; then
    echo "Usage: $0 <patch|minor|major|x.y.z>"
    exit 1
fi

BUMP="$1"

# Resolve the new version from the first package
CURRENT=$(node -p "require('$ROOT_DIR/${PACKAGES[0]}/package.json').version")

if [[ "$BUMP" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    NEW_VERSION="$BUMP"
elif [ "$BUMP" = "patch" ] || [ "$BUMP" = "minor" ] || [ "$BUMP" = "major" ]; then
    IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
    case "$BUMP" in
        patch) NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))" ;;
        minor) NEW_VERSION="$MAJOR.$((MINOR + 1)).0" ;;
        major) NEW_VERSION="$((MAJOR + 1)).0.0" ;;
    esac
else
    echo "Error: argument must be patch, minor, major, or a semver like 1.2.3"
    exit 1
fi

echo "Bumping $CURRENT -> $NEW_VERSION"

# Update root package.json
node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('$ROOT_DIR/package.json', 'utf8'));
p.version = '$NEW_VERSION';
fs.writeFileSync('$ROOT_DIR/package.json', JSON.stringify(p, null, 2) + '\n');
"

# Update each package
for PKG in "${PACKAGES[@]}"; do
    PKG_JSON="$ROOT_DIR/$PKG/package.json"
    node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('$PKG_JSON', 'utf8'));
p.version = '$NEW_VERSION';
fs.writeFileSync('$PKG_JSON', JSON.stringify(p, null, 2) + '\n');
"
    echo "  Updated $PKG to $NEW_VERSION"
done

echo ""
echo "All packages set to $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  git add -A && git commit -m \"chore: bump versions to $NEW_VERSION\""
echo "  git tag v$NEW_VERSION"
echo "  git push origin main v$NEW_VERSION"
