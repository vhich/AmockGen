import fs from "fs";
import path from "path";
import { defaultOpenApiTemp } from "./data";

const DEFAULT_OPENAPI_TEMPLATE = defaultOpenApiTemp;

export function resolveSpecFile(customPath?: string): string {
  // Use the directory where the user ran the command from terminal
  const userCwd = process.env.INIT_CWD || process.cwd();

  if (customPath) {
    const resolvedPath = path.resolve(userCwd, customPath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(
        `\n ✖ Error: No OpenAPI specification file found at ${customPath}\n`,
      );
      process.exit(1);
    }
    return resolvedPath;
  }

  const fallbacks = ["openapi.json", "openapi.yaml", "openapi.yml"];
  for (const file of fallbacks) {
    const fullPath = path.resolve(userCwd, file);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  // Create default openapi.json template in the user's terminal root directory
  const targetPath = path.resolve(userCwd, "openapi.json");
  console.log(
    `\n✨ No spec file found in directory. Generating starter template at ${targetPath}...`,
  );
  fs.writeFileSync(
    targetPath,
    JSON.stringify(DEFAULT_OPENAPI_TEMPLATE, null, 2),
    "utf-8",
  );
  return targetPath;
}
