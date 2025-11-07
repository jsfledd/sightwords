# Share Collections Feature

## How to Share Collections

### For Admins (Creating Share Links)

1. Navigate to `/admin` (secret route - not shown in main UI)
2. Edit or create your collections
3. Click the "📤 Generate Share Link" button
4. The link will be automatically copied to your clipboard
5. Share the link with others via text, email, or any messaging app

### For Users (Receiving Collections)

When you receive a share link, simply:
1. Click the link on your device (works great on mobile with PWA)
2. You'll see a preview of all collections being shared
3. Uncheck any collections you don't want to add
4. Click "Add to Sight Words"
5. If a collection with the same name exists, you'll be prompted to overwrite it

### Example Share URL Format

```
https://jfledd.github.io/sightwords/addCollections?collections=W3sibmFtZSI6Ikxpc3QgMSIsIndvcmRzIjpbInRoZSIsImFuZCIsImlzIl19XQ==
```

The `collections` parameter contains base64-encoded JSON data with collection names and words.

### Example: Generate a Share Link Programmatically

```javascript
import { generateShareUrl } from './src/utils/shareCollections'

const collections = [
  { name: "Animals", words: ["cat", "dog", "bird", "fish"] },
  { name: "Colors", words: ["red", "blue", "green", "yellow"] }
]

const shareUrl = generateShareUrl(
  collections,
  'https://jfledd.github.io/sightwords'
)

console.log(shareUrl)
```

### Test Link (List 1, 2, 3)

Here's a test link with the default collections:

```
https://jfledd.github.io/sightwords/addCollections?collections=W3sibmFtZSI6Ikxpc3QgMSIsIndvcmRzIjpbInRoZSIsImFuZCIsImlzIiwiaXQiLCJpbiIsInRvIiwieW91IiwiaGUiLCJ3ZSIsIm1lIl19LHsibmFtZSI6Ikxpc3QgMiIsIndvcmRzIjpbImEiLCJJIiwic2VlIiwiY2FuIiwibGlrZSIsImdvIiwibXkiLCJhdCIsInVwIiwibm8iXX0seyJuYW1lIjoiTGlzdCAzIiwid29yZHMiOlsiYW0iLCJkbyIsInNvIiwib24iLCJiZSIsInNoZSIsInNhaWQiLCJmb3IiLCJoZXJlIiwibG9vayJdfV0=
```

## Features

- ✅ URL-based collection sharing
- ✅ Base64 encoding for clean URLs
- ✅ Checkbox selection (all checked by default)
- ✅ Preview collections before importing
- ✅ Overwrite protection with confirmation dialogs
- ✅ Sequential imports (one at a time)
- ✅ Mobile-friendly PWA support
- ✅ Automatic clipboard copy in admin
