import deleteBase from "./deleteBase.js";
import { getSchema } from "../../../config/getSchema.js";

const deleteWithChecks = ({ table, pk }) => {
    const schema = getSchema(table);

    if (!pk) {
        throw new Error("pk is required");
    }

    return deleteBase({ table, pk });
};

export default deleteWithChecks;