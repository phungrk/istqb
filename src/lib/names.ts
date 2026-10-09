/** "linh.nguyen@gmail.com" → "Linh Nguyen", "user007" → "User007". */
export const nameFromHandle = (handle: string) =>
  handle
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
