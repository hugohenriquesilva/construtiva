export function DateMask(text: string): {
  masked: string;
  date: Date | undefined;
} {
  const cleaned = text.replace(/\D/g, "");

  let masked = cleaned;
  if (cleaned.length > 2) masked = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
  if (cleaned.length > 4)
    masked = masked.slice(0, 5) + "/" + cleaned.slice(4, 8);

  if (cleaned.length === 8) {
    const date = new Date(
      `${cleaned.slice(4, 8)}-${cleaned.slice(2, 4)}-${cleaned.slice(0, 2)}`,
    );
    return { masked, date: isNaN(date.getTime()) ? undefined : date };
  }

  return { masked, date: undefined };
}
