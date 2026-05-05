import updateBase from "./updateBase.js";
import validate from "../../../helpers/validate.js";
import { getSchema } from "../../../config/getSchema.js";

const updateWithChecks = ({ table, pk, record }) => {
    if (!pk) throw new Error("pk is required");

    const schema = getSchema(table);

    // merge for validation
    const merged = { ...record, pk };

    validate(schema, merged); // 🔥 reuse same validator

    return updateBase({ table, pk, updates: record });
};

export default updateWithChecks;