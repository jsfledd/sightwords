# Sight Words Flashcards

A Vue 3 Progressive Web App (PWA) for practicing sight words with customizable flashcard collections.

## Features

- Customizable flashcard collections
- Progress tracking and statistics
- Practice sessions with configurable settings
- Import/Export data functionality
- Progressive Web App with offline support
- Default kindergarten word lists included

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This app is deployed to GitHub Pages using GitHub Actions. The deployment workflow is configured in `.github/workflows/deploy.yml`.

### Important Configuration Notes

#### npm Registry Configuration

The project includes a `.npmrc` file that explicitly sets the npm registry to the standard public registry:

```
registry=https://registry.npmjs.org/
```

**Why this is critical:** Without this configuration, npm may attempt to use alternative registries (like private corporate registries) if they're configured in your user-level `.npmrc`. This causes deployment failures in GitHub Actions when those private registries are not accessible.

The `package-lock.json` must reference packages from `https://registry.npmjs.org/` only. If you see references to other registries:

1. Ensure `.npmrc` contains `registry=https://registry.npmjs.org/`
2. Delete `node_modules/` and `package-lock.json`
3. Run `npm install` to regenerate with correct registry URLs

#### GitHub Actions Workflow

The deployment workflow:
1. Uses Node.js 20 with npm caching
2. Downgrades to npm 9 (npm 10.x had issues with `.bin` directory creation in CI)
3. Installs dependencies with `npm install`
4. Builds with `npm run build:ci` (skips TypeScript checking for faster builds)
5. Deploys to GitHub Pages

Key learnings from deployment troubleshooting:
- **npm 10.x issue**: npm 10.8.2 had problems creating the `node_modules/.bin/` directory with proper symlinks in GitHub Actions CI environment
- **Registry configuration**: Must explicitly set registry in project `.npmrc` to avoid private registry resolution
- **Hash-based routing**: Uses `createWebHashHistory` instead of `createWebHistory` for GitHub Pages compatibility

### Build Scripts

- `npm run build` - Full build with TypeScript type checking
- `npm run build:ci` - CI build without type checking (faster, used in deployment)

## Project Structure

- `/src/views/` - Vue components for main pages
- `/src/stores/` - Pinia stores for state management
- `/src/utils/` - Utility functions including data management
- `/public/` - Static assets including default word collections
- `/.github/workflows/` - GitHub Actions deployment configuration
