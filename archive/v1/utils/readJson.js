// utils/readJson.js
import fs from "fs/promises";

export async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
};