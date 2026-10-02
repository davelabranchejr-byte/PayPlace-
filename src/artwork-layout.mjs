export function artworkLayout(width, height, sourceWidth, sourceHeight, crop, mode = "contain") {
  const [x, y, w, h] = crop;
  if (!(width > 0 && height > 0 && w > 0 && h > 0)) return null;
  const scale = (mode === "contain" ? Math.min : Math.max)(width / w, height / h);
  return {
    frame: {
      position: "absolute", width: w * scale, height: h * scale,
      left: (width - w * scale) / 2, top: (height - h * scale) / 2,
      overflow: "hidden",
    },
    image: {
      position: "absolute", width: sourceWidth * scale, height: sourceHeight * scale,
      left: -x * scale, top: -y * scale,
    },
  };
}
