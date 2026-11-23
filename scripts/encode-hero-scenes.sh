#!/usr/bin/env bash
set -euo pipefail

render_root="${1:?Pass the directory containing 01–07 Blender renders}"
asset_dir="${2:-assets/hero-scenes}"
mkdir -p "$asset_dir"

for scene_no in 01 02 03 04 05 06 07; do
  ffmpeg -hide_banner -loglevel error -y \
    -i "$render_root/$scene_no/poster.png" -frames:v 1 \
    -c:v libwebp -quality 90 -compression_level 6 \
    "$asset_dir/$scene_no.webp"
  ffmpeg -hide_banner -loglevel error -y \
    -framerate 12 -start_number 1 -i "$render_root/$scene_no/frames/frame_%04d.png" \
    -vf 'minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,format=yuv420p' \
    -an -c:v libx264 -preset slow -crf 22 -movflags +faststart \
    "$asset_dir/$scene_no.mp4"
done
