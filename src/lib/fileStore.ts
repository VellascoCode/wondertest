import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export async function readJSON<T>(fileName: string, defaultValue: T): Promise<T> {
  try {
    const filePath = path.join(dataDir, fileName);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeJSON(fileName, defaultValue);
      return defaultValue;
    }
    console.error(`Erro ao ler ${fileName}:`, error);
    throw error;
  }
}

export async function writeJSON<T>(fileName: string, data: T): Promise<void> {
  const filePath = path.join(dataDir, fileName);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
