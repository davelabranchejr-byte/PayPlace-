// Measured inside Chapo's open mouth on the 1536 x 1024 celebration artwork.
export const CHAPO_MOUTH = Object.freeze({ x: 746, y: 443, width: 1536, height: 1024 });
export const TREAT_SIZE = 28;

export function treatFlight(width, height, index) {
  const scale = Math.min(width / CHAPO_MOUTH.width, height / CHAPO_MOUTH.height);
  const offsetX = (width - CHAPO_MOUTH.width * scale) / 2;
  const offsetY = (height - CHAPO_MOUTH.height * scale) / 2;
  const startLeft = width * (0.07 + index * 0.12) - TREAT_SIZE / 2;
  const mouthX = offsetX + CHAPO_MOUTH.x * scale;
  const mouthY = offsetY + CHAPO_MOUTH.y * scale;
  return { startLeft, mouthX, mouthY,
    translateX: mouthX - TREAT_SIZE / 2 - startLeft,
    translateY: mouthY - TREAT_SIZE / 2 };
}
