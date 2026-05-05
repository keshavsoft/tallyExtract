import insertBase from "./insertBase.js";
import { getConfig } from "../../../../core/configStore.js";
import { buildDataPath } from "../../../../utils/pathBuilder.js";
import { readData } from "../../../helpers/file/read.js";
import { getSchema } from "../../../config/getSchema.js";
import { getPrimaryKey, attachPrimaryKey } from "../../../helpers/pkHelper.js";

const validateInput = ({ table, record }) => {
    if (!table) throw new Error("table is required");
    if (!record || typeof record !== "object") throw new Error("record must be object");
};

const safeGetSchema = (table) => {
    const schema = getSchema(table);
    if (!schema?.columns) throw new Error(`Invalid schema for "${table}"`);
    return schema;
};

const getData = (table) => {
    const config = getConfig();
    const path = buildDataPath(config, table);
    return readData(path);
};

const insertGenPk = ({ table, record }) => {
    validateInput({ table, record });

    const schema = safeGetSchema(table);
    const pk = getPrimaryKey(schema.columns);

    if (record[pk] !== undefined) {
        return insertBase({ table, record });
    }

    const data = getData(table);
    const newRecord = attachPrimaryKey(record, pk, data);

    return insertBase({ table, record: newRecord });
};

export default insertGenPk;