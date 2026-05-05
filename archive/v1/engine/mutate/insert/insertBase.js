import { getConfig } from "../../../../core/configStore.js";
import { buildDataPath } from "../../../../utils/pathBuilder.js";
import { readData } from "../../../helpers/file/read.js";
import { writeData } from "../../../helpers/file/write.js";

const insertBase = ({ table, record }) => {
    const config = getConfig();
    const path = buildDataPath(config, table);

    const data = readData(path);

    data.push(record);

    writeData(path, data);

    return record;
};

export default insertBase;