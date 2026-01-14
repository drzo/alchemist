#!/bin/bash
# Download Google Fonts for self-hosting
# This script downloads the fonts used in the Tensor Logic demo

set -e

FONTS_DIR="src/fonts"
mkdir -p "$FONTS_DIR"

echo "Downloading fonts for self-hosting..."

# Crimson Pro: Regular 400, Regular 600, Italic 400
echo "Downloading Crimson Pro..."
curl -L "https://fonts.google.com/download?family=Crimson%20Pro" -o "$FONTS_DIR/crimson-pro.zip"
unzip -q "$FONTS_DIR/crimson-pro.zip" -d "$FONTS_DIR/crimson-pro"
rm "$FONTS_DIR/crimson-pro.zip"

# JetBrains Mono: Regular 400, Medium 500, SemiBold 600
echo "Downloading JetBrains Mono..."
curl -L "https://fonts.google.com/download?family=JetBrains%20Mono" -o "$FONTS_DIR/jetbrains-mono.zip"
unzip -q "$FONTS_DIR/jetbrains-mono.zip" -d "$FONTS_DIR/jetbrains-mono"
rm "$FONTS_DIR/jetbrains-mono.zip"

# Outfit: Light 300, Regular 400, Medium 500, SemiBold 600, Bold 700
echo "Downloading Outfit..."
curl -L "https://fonts.google.com/download?family=Outfit" -o "$FONTS_DIR/outfit.zip"
unzip -q "$FONTS_DIR/outfit.zip" -d "$FONTS_DIR/outfit"
rm "$FONTS_DIR/outfit.zip"

echo "Fonts downloaded successfully!"
echo "Next steps:"
echo "1. Review the font files in $FONTS_DIR"
echo "2. Create @font-face declarations in src/fonts.css"
echo "3. Update src/index.html to use local fonts"

