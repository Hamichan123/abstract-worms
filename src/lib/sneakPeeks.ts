import fs from "fs";
import path from "path";

export type SneakPeek = {
  id: number;
  title: string;
  description: string;
  src: string;
};

export function getSneakPeeks(): SneakPeek[] {
  const publicDir = path.join(process.cwd(), "public");
  const dirPath = path.join(publicDir, "sneek-peeks");
  const exts = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs
    .readdirSync(dirPath)
    .filter((file) => exts.includes(path.extname(file).toLowerCase()));

  let id = 1;
  return files.map((file) => {
    const baseName = path.parse(file).name.replace(/[-_]+/g, " ");
    const title = baseName.charAt(0).toUpperCase() + baseName.slice(1);

    return {
      id: id++,
      title,
      description: "Sneak peek from the Abstract Worms galerie.",
      src: `/sneek-peeks/${encodeURIComponent(file)}`,
    };
  });
}
