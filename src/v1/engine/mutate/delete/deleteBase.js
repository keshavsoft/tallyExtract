import { getConfig } from "../../../../core/configStore.js";
import { buildDataPath } from "../../../../utils/pathBuilder.js";
import { readData } from "../../../helpers/file/read.js";
import { writeData } from "../../../helpers/file/write.js";

const deleteBase = ({ table, pk }) => {
    const config = getConfig();
    const path = buildDataPath(config, table);

    const data = readData(path);

    const index = data.findIndex(r => r.pk === pk);

    if (index === -1) {
        throw new Error(`Record with pk ${pk} not found`);
    }

    const deleted = data[index];
    data.splice(index, 1);

    writeData(path, data);

    return deleted;
};

export default deleteBase;