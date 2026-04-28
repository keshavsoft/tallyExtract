import { getConfig } from "../../../core/configStore.js";
import { buildDataPath } from "../../../utils/pathBuilder.js";
import { readData } from "../../helpers/file/read.js";

const findAll = ({ table }) => {
  const config = getConfig();
  const path = buildDataPath(config, table);

  const data = readData(path);

  return data;
};

export default findAll;