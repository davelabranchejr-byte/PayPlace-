// Coordinates are measured on the full 1024 x 1536 gallery artwork.
// Keep the image uncropped so each portrait stays aligned with its tap target.
export const FAMILY_WALL_SIZE = Object.freeze({ width: 1024, height: 1536 });

export function familyGallerySize(availableWidth) {
  const width = Number.isFinite(availableWidth) ? Math.min(540, Math.max(0, availableWidth)) : 0;
  return { width, height: width * FAMILY_WALL_SIZE.height / FAMILY_WALL_SIZE.width };
}

export const FAMILY_PORTRAITS = Object.freeze({
  daddy: { frame: [351, 88, 370, 522], crop: [395, 153, 290, 389], label: "Daddy in his teal PayPlace hoodie" },
  westley: { frame: [28, 210, 318, 400], crop: [88, 276, 218, 265], label: "Westley in his teal crayon-and-paw frame" },
  tate: { frame: [730, 214, 267, 398], crop: [769, 269, 177, 275], label: "Tate with a stolen sock in his orange sock frame" },
  bobbie: { frame: [15, 613, 370, 488], crop: [82, 672, 246, 330], label: "Tabby Bobbie with straight blonde hair, a butterfly clip, a purple outfit and pink collar against a blue background" },
  chapo: { frame: [717, 620, 300, 511], crop: [761, 692, 215, 341], label: "Chapo enjoying cookies in his golden snack frame" },
  annie: { frame: [389, 626, 323, 574], crop: [438, 703, 220, 349], label: "Great Annie in her leafy oval frame with white flowers" },
});

export function portraitFrameStyle(id) {
  const { frame: [x, y, width, height] } = FAMILY_PORTRAITS[id];
  return {
    left: `${x / FAMILY_WALL_SIZE.width * 100}%`,
    top: `${y / FAMILY_WALL_SIZE.height * 100}%`,
    width: `${width / FAMILY_WALL_SIZE.width * 100}%`,
    height: `${height / FAMILY_WALL_SIZE.height * 100}%`,
  };
}
