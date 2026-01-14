# Self-Hosted Fonts

<!-- TOC -->

- [Fonts Used](#fonts-used)
- [Download Instructions](#download-instructions)
  - [Option 1: Using google-webfonts-helper (Recommended)](#option-1-using-google-webfonts-helper-recommended)
  - [Option 2: Manual Download from Google Fonts](#option-2-manual-download-from-google-fonts)
  - [Option 3: Using npm package (if available)](#option-3-using-npm-package-if-available)
- [File Structure](#file-structure)
- [Benefits of Self-Hosting](#benefits-of-self-hosting)
- [Verification](#verification)

<!-- /TOC -->
This directory contains self-hosted Google Fonts for the Tensor Logic demo.

## Fonts Used

- **Crimson Pro** (serif) - Body text
  - Regular 400
  - SemiBold 600
  - Italic 400

- **JetBrains Mono** (monospace) - Code blocks
  - Regular 400
  - Medium 500
  - SemiBold 600

- **Outfit** (sans-serif) - Display/headings
  - Light 300
  - Regular 400
  - Medium 500
  - SemiBold 600
  - Bold 700

## Download Instructions

### Option 1: Using google-webfonts-helper (Recommended)

1. Visit [google-webfonts-helper](https://gwfh.mranftl.com/fonts)
2. Search for each font and download:
   - Crimson Pro (select: Regular 400, SemiBold 600, Italic 400)
   - JetBrains Mono (select: Regular 400, Medium 500, SemiBold 600)
   - Outfit (select: Light 300, Regular 400, Medium 500, SemiBold 600, Bold 700)
3. Extract each font's files into the corresponding subdirectory:
   - `crimson-pro/static/`
   - `jetbrains-mono/static/`
   - `outfit/static/`

### Option 2: Manual Download from Google Fonts

1. Visit [Google Fonts](https://fonts.google.com/)
2. For each font:
   - Click "Download family"
   - Extract the ZIP file
   - Copy the static font files (`.ttf` files) to the appropriate subdirectory

### Option 3: Using npm package (if available)

```bash
npm install --save-dev @fontsource/crimson-pro @fontsource/jetbrains-mono @fontsource/outfit
```

Then update `src/fonts.css` to reference the npm package paths.

## File Structure

After downloading, the structure should be:

```
src/fonts/
├── README.md
├── crimson-pro/
│   └── static/
│       ├── CrimsonPro-Regular.ttf
│       ├── CrimsonPro-SemiBold.ttf
│       └── CrimsonPro-Italic.ttf
├── jetbrains-mono/
│   └── static/
│       ├── JetBrainsMono-Regular.ttf
│       ├── JetBrainsMono-Medium.ttf
│       └── JetBrainsMono-SemiBold.ttf
└── outfit/
    └── static/
        ├── Outfit-Light.ttf
        ├── Outfit-Regular.ttf
        ├── Outfit-Medium.ttf
        ├── Outfit-SemiBold.ttf
        └── Outfit-Bold.ttf
```

## Benefits of Self-Hosting

✅ **Security**: No external CDN dependencies  
✅ **Privacy**: No tracking by Google Fonts  
✅ **Performance**: Faster loading (no external requests)  
✅ **Reliability**: Works offline, no CDN outages  
✅ **Subresource Integrity**: Can verify font file integrity  

## Verification

After downloading fonts:
1. Build the project: `npm run build`
2. Check that fonts load correctly in the browser
3. Verify no console errors about missing fonts
4. Test that all font weights/styles display correctly

