import { getConfig } from "../../../core/configStore.js";
import { buildDataPath } from "../../../utils/pathBuilder.js";
import { readData } from "../../helpers/file/read.js";

const filterByColumns = ({ table, where = {} }) => {
    const cfg = getConfig();
    const path = buildDataPath(cfg, table);

    const data = readData(path) || [];

    return data.filter(row =>
        Object.entries(where).every(([key, val]) =>
            row[key] === val
        )
    );
};

export default filterByColumns;