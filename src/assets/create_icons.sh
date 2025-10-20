#!/bin/bash
# Create placeholder icons using ImageMagick (if available) or simple colored squares

# Colors: Nextcloud blue
COLOR="#0082c9"

# Create simple SVG icons and convert to PNG
for size in 16 32 64 128; do
  cat > icon-${size}.svg << SVGEOF
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${COLOR}"/>
  <text x="50%" y="50%" font-family="Arial" font-size="$((size/2))" fill="white" text-anchor="middle" dy=".3em">NC</text>
</svg>
SVGEOF
done

echo "Icon placeholders created (SVG format)"
