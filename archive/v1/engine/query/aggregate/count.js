import { getConfig } from "../../../../core/configStore.js";
import { buildDataPath } from "../../../../utils/pathBuilder.js";

import { readData } from "../../../helpers/file/read.js";

export default ({ table }) => {
    const cfg = getConfig();
    const path = buildDataPath(cfg, table);

    const data = readData(path) || [];

    return Array.isArray(data) ? data.length : 0;
};