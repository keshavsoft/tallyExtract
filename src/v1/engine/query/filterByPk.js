import { getConfig } from "../../../core/configStore.js";
import { buildDataPath } from "../../../utils/pathBuilder.js";
import { getPrimaryKey } from "../../helpers/pkHelper.js";
import { getSchema } from "../../config/getSchema.js";
import { readData } from "../../helpers/file/read.js";

const filterByPk = ({ table, id }) => {
  const cfg = getConfig();
  const schema = getSchema(table);
  const pk = getPrimaryKey(schema.columns);

  const path = buildDataPath(cfg, table);
  const data = readData(path);

  return data.filter(row => Number(row[pk]) === Number(id)) || [];
};

export default filterByPk;