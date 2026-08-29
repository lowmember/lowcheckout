/** URLs de imagem e de entregável precisam ser absolutas (RF-PROD-01). */
export function isAbsoluteUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
