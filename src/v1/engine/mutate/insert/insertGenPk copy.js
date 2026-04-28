import insertBase from "./insertBase.js";

import { getConfig } from "../../../../core/configStore.js";
import { buildDataPath } from "../../../../utils/pathBuilder.js";
import { readData } from "../../../helpers/file/read.js";

import { getSchema } from "../../../config/getSchema.js";
import { getPrimaryKey, attachPrimaryKey } from "../../../helpers/pkHelper.js";

const insertGenPk = ({ table, record }) => {
    let schema;
    try {
        schema = getSchema(table);
    } catch (err) {
        console.error(err.message);
        return; // or throw based on your design
    };

    // const schema = getSchema(table);
    const pk = getPrimaryKey(schema.columns);

    // ✅ if pk already exists, skip generation
    if (record[pk] !== undefined) {
        return insertBase({ table, record });
    }

    const config = getConfig();
    const path = buildDataPath(config, table);
    const data = readData(path);

    const newRecord = attachPrimaryKey(record, pk, data);

    return insertBase({
        table,
        record: newRecord
    });
};

export default insertGenPk;