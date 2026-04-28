import { getConfig } from "../../../../core/configStore.js";
import { buildDataPath } from "../../../../utils/pathBuilder.js";
import { readData } from "../../../helpers/file/read.js";
import { writeData } from "../../../helpers/file/write.js";

const updateBase = ({ table, pk, updates }) => {
    const config = getConfig();
    const path = buildDataPath(config, table);

    const data = readData(path);

    const index = data.findIndex(r => r.pk === pk);
    if (index === -1) {
        throw new Error(`Record with pk ${pk} not found`);
    }

    const existing = data[index];
    const updated = { ...existing, ...updates, pk: existing.pk }; // 🔥 keep pk safe

    data[index] = updated;
    writeData(path, data);

    return updated;
};

export default updateBase;