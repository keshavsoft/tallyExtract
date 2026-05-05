import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../../Import/Templates/template.json");

const startFunc = () => {
    try {
        // const filePath = path.join("../../Import/Templates", "template.json");
        let template = fs.readFileSync(filePath, "utf8");

        let data = JSON.parse(template);

        return data;
    } catch (err) {
        console.error("Import Failed");
        console.log(err.response?.data || err.message);
    };
};

export { startFunc };