import fs from "fs";
import path from "path";
import { getConfig } from "../../core/configStore.js";

export const getSchema = (table) => {
    const config = getConfig();

    const schemaPath = path.join(config.SchemaPath, `${table}.json`);

    if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema not found for table "${table}" at ${schemaPath}`);
    }

    try {
        const schema = fs.readFileSync(schemaPath, "utf-8");
        return JSON.parse(schema);
    } catch (err) {
        throw new Error(`Invalid schema JSON for "${table}": ${err.message}`);
    };
};