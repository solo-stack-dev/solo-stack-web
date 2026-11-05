#!/usr/bin/env bash
# Critique screenshot set of every page: scripts/site-screens.sh <base url> <outDir>
# Homepage: 1440 + 390, motion and reduced, with seams. Subpages: 1440 + 390, light and dark, plus 1920 dark.
set -u
BASE=${1:-http://localhost:5173}
OUT=${2:-docs/screens/critique}
TOOL=src/lib/home/shared/tools/scroll-screens.mjs
POST=$(ls src/content/blog | head -1 | sed 's/\.md$//')
node $TOOL "$BASE/" "$OUT/home" --prefix home-1440 --step 1 --seams --settle 1200
node $TOOL "$BASE/" "$OUT/home" --prefix home-390 --width 390 --height 844 --step 1 --settle 1200
node $TOOL "$BASE/" "$OUT/home" --prefix home-1440-reduced --reduced --step 1
for page in blog "blog/$POST" stats kontakt; do
	name=${page//\//-}
	for theme in dark light; do
		node $TOOL "$BASE/$page" "$OUT/$name" --prefix "$name-1440-$theme" --theme $theme --step 0.9
		node $TOOL "$BASE/$page" "$OUT/$name" --prefix "$name-390-$theme" --theme $theme --width 390 --height 844 --step 0.9
	done
	node $TOOL "$BASE/$page" "$OUT/$name" --prefix "$name-1920-dark" --theme dark --width 1920 --height 1080 --step 0.9
done
node $TOOL "$BASE/does-not-exist" "$OUT/404" --prefix 404-1440 --step 1
