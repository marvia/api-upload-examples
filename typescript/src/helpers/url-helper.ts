export function getVariantUrl(baseUrl: string, prefix: string): string {
  try {
    const url = new URL(baseUrl);
    const parts = url.pathname.split("/");
    const fileName = parts.pop() || "";
    const idx = fileName.lastIndexOf(".");
    if (idx === -1) return baseUrl;

    const newFileName = `${prefix}${fileName}`;
    parts.push(newFileName);
    url.pathname = parts.join("/");
    return url.toString();
  } catch {
    return baseUrl;
  }
}
