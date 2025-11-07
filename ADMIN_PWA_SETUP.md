# Admin PWA Setup

## Overview

The Sight Words app now supports **two separate PWA installations**:

1. **Main PWA** - For end users practicing sight words
2. **Admin PWA** - For managing collections, generating share links, and editing word lists

Both PWAs share the same codebase but have different entry points and can be installed independently.

---

## Installation URLs

### Main PWA (User-Facing)
- **URL**: `https://jfledd.github.io/sightwords/`
- **Start URL**: `/sightwords/`
- **Purpose**: Practice flashcards, track progress
- **Theme Color**: Blue (#2563eb)

### Admin PWA
- **URL**: `https://jfledd.github.io/sightwords/admin.html`
- **Start URL**: `/sightwords/admin`
- **Purpose**: Manage collections, generate share links
- **Theme Color**: Purple (#6d28d9)

---

## How to Install

### Method 1: Direct Installation

**On Mobile:**
1. Navigate to `https://jfledd.github.io/sightwords/admin.html`
2. Tap the browser's share button
3. Select "Add to Home Screen"
4. The Admin PWA will be installed and open directly to the admin interface

**On Desktop:**
1. Navigate to `https://jfledd.github.io/sightwords/admin.html`
2. Look for the install icon in the address bar (usually a ⊕ or 💻 icon)
3. Click "Install"
4. The Admin PWA will open as a standalone app

### Method 2: Via Install Page

1. Navigate to `/install-admin` in the main app
2. Follow the on-screen instructions
3. Copy the admin URL to share with other admins

---

## Features

### Main PWA Features
- ✅ Practice flashcards from collections
- ✅ Track progress with sparkline graphs
- ✅ Session-based accuracy tracking
- ✅ Multi-collection practice mode
- ✅ Offline support
- ✅ Add custom collections

### Admin PWA Features
- ✅ Create and edit collections
- ✅ Persistent localStorage for admin collections
- ✅ Generate shareable collection links
- ✅ Export collections to JSON
- ✅ Import from JSON file
- ✅ CSV and per-line word formats
- ✅ Offline editing support
- ✅ Mobile-friendly responsive design

---

## Technical Details

### File Structure
```
flashcards/
├── index.html                          # Main PWA entry point
├── admin.html                          # Admin PWA entry point
├── public/
│   ├── manifest.webmanifest           # Main PWA manifest
│   └── admin-manifest.webmanifest     # Admin PWA manifest
└── src/
    ├── main.ts                        # Shared entry point
    └── views/
        ├── CollectionsView.vue        # Main app
        ├── AdminView.vue              # Admin interface
        └── AdminInstallView.vue       # Install instructions
```

### Manifest Configurations

**Main Manifest** (`manifest.webmanifest`):
- Start URL: `/sightwords/`
- Scope: `/sightwords/`
- Opens to collections view

**Admin Manifest** (`admin-manifest.webmanifest`):
- Start URL: `/sightwords/admin`
- Scope: `/sightwords/`
- Opens to admin view

### Storage Separation

The Admin PWA uses **separate localStorage** to avoid conflicts:
- **Main PWA**: `flashcards-collections` key
- **Admin PWA**: `flashcards-admin-collections` key

This allows:
- Users to have their own collections
- Admins to maintain a separate set of default/shareable collections
- No conflicts between user and admin data

---

## Sharing Collections

Admins can create collections and share them with users:

1. Open Admin PWA
2. Create/edit collections
3. Click "📤 Generate Share Link"
4. Share the generated URL via text/email
5. Recipients click the link to import collections

Share URLs look like:
```
https://jfledd.github.io/sightwords/addCollections?collections=<base64_data>
```

---

## Development Notes

### Building
Both entry points are built together:
```bash
npm run build
```

This generates:
- `dist/index.html` - Main PWA
- `dist/admin.html` - Admin PWA
- `dist/manifest.webmanifest` - Main manifest
- `dist/admin-manifest.webmanifest` - Admin manifest

### Vite Configuration
The `vite.config.ts` includes:
```typescript
build: {
  rollupOptions: {
    input: {
      main: resolve(__dirname, 'index.html'),
      admin: resolve(__dirname, 'admin.html')
    }
  }
}
```

### Adding to GitHub Pages
Both HTML files are served from the same domain, so users can install either PWA version independently.

---

## User Workflow Example

**For Admins:**
1. Install Admin PWA from `admin.html`
2. Create collections (e.g., "Grade 1 Words", "Dolch List")
3. Generate share link
4. Send link to parents/teachers

**For End Users:**
1. Install Main PWA from main URL
2. Receive share link from admin
3. Click link to preview collections
4. Select and import desired collections
5. Practice with flashcards

---

## Benefits

✅ **Separate installations** - Users and admins don't interfere with each other
✅ **Different starting points** - Each PWA opens where it should
✅ **Shared codebase** - Maintain one project for both versions
✅ **Easy sharing** - Admins can easily distribute collections
✅ **Offline capable** - Both PWAs work without internet
✅ **Professional** - Admins get dedicated tools for management
