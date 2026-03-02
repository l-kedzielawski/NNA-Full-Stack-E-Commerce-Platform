import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(moduleDir, "..");

const legacyContentRoots = [
  path.join(appRoot, "..", "content"),
  path.join(appRoot, "..", "react-migration", "content"),
  path.join(appRoot, "..", "themysticaroma", "react-migration", "content"),
];

const contentRoots = [process.env.CONTENT_DIR, path.join(appRoot, "content"), ...legacyContentRoots]
  .filter((value): value is string => Boolean(value));

export function readContentFile(fileName: string): string {
  const triedPaths = contentRoots.map((root) => path.join(root, fileName));

  const existingPath = triedPaths.find((candidatePath) => fs.existsSync(candidatePath));

  if (!existingPath) {
    throw new Error(
      `Unable to locate ${fileName}. Set CONTENT_DIR or place data in one of: ${triedPaths.join(", ")}`,
    );
  }

  return fs.readFileSync(existingPath, "utf8");
}
