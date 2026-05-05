import insertBase from "./insertBase.js";
import validate from "../../../helpers/validate.js";

import { getSchema } from "../../../config/getSchema.js";
import { getPrimaryKey, attachPrimaryKey } from "../../../helpers/pkHelper.js";

import { getConfig } from "../../../../core/configStore.js";
import { buildDataPath } from "../../../../utils/pathBuilder.js";
import { readData } from "../../../helpers/file/read.js";

const insertWithChecks1 = ({ table, record }) => {
    const schema = getSchema(table);

    // 🔥 PK handling
    const pk = getPrimaryKey(schema.columns);

    if (record[pk] === undefined) {
        const config = getConfig();
        const path = buildDataPath(config, table);
        const data = readData(path);

        record = attachPrimaryKey(record, pk, data);
    }

    // 🔥 validate AFTER pk
    validate(schema, record);

    return insertBase({ table, record });
};

const insertWithChecks = ({ table, record }) => {
    try {
        const schema = getSchema(table);
        const pk = getPrimaryKey(schema.columns);

        if (record[pk] === undefined) {
            const config = getConfig();
            const path = buildDataPath(config, table);
            const data = readData(path);
            record = attachPrimaryKey(record, pk, data);
        }

        validate(schema, record);

        return insertBase({ table, record });

    } catch (err) {
        throw new Error(`Insert failed [${table}]: ${err.message}`);
    }
};

export default insertWithChecks;