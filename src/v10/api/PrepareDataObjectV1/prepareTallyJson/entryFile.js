import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

import templateJson from "../../Import/Templates/template.json" with {type: "json"};

const startFunc = () => {
    try {
        const data = structuredClone(templateJson);

        return data;
    } catch (err) {
        console.error("Import Failed");
        console.log(err.response?.data || err.message);
    };
};

export { startFunc };