import fs from "fs";

export const writeData = (path, data) => {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
};