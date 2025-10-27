const MIN_PART_SIZE = 5 * 1024 * 1024;

export function splitFile(file: File, requestedParts: number): Blob[] {
  if (file.size <= MIN_PART_SIZE) {
    return [file];
  }
  const minRequiredSize = (requestedParts - 1) * MIN_PART_SIZE;
  if (file.size < minRequiredSize) {
    const fullParts = Math.floor(file.size / MIN_PART_SIZE);
    const parts: Blob[] = [];
    let start = 0;
    for (let i = 0; i < fullParts; i++) {
      parts.push(file.slice(start, start + MIN_PART_SIZE));
      start += MIN_PART_SIZE;
    }
    if (start < file.size) {
      parts.push(file.slice(start, file.size));
    }
    return parts;
  }

  const parts: Blob[] = [];
  let start = 0;
  for (let i = 0; i < requestedParts - 1; i++) {
    parts.push(file.slice(start, start + MIN_PART_SIZE));
    start += MIN_PART_SIZE;
  }

  parts.push(file.slice(start, file.size));
  return parts;
}
