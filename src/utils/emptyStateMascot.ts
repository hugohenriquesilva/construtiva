const CHARACTER_ASPECT_RATIO = 175 / 209;
const MAX_CHARACTER_WIDTH = 175;

export function getEmptyStateMascotSize(
  availableWidth: number,
  availableHeight: number,
  imageAspectRatio = CHARACTER_ASPECT_RATIO,
): { width: number; height: number } {
  const characterWidth = Math.max(
    0,
    Math.min(
      (availableWidth - 48) * 0.44,
      availableHeight * 0.42 * CHARACTER_ASPECT_RATIO,
      MAX_CHARACTER_WIDTH,
    ),
  );
  const height = characterWidth / CHARACTER_ASPECT_RATIO;

  return { width: height * imageAspectRatio, height };
}
