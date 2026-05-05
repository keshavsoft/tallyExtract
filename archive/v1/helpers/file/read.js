import fs from "fs";

export const readData = (path) => {
    if (!fs.existsSync(path)) return [];

    return JSON.parse(fs.readFileSync(path, "utf-8"));
};