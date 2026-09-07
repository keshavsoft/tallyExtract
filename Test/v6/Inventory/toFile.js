import fs from "fs";
import { inventoryV3 } from "../../../index.js";

const jsonFileName = "purchases.json";

inventoryV3({ inSvCurrentCompany: "Split Full" }).then(promiseData => {

    fs.writeFileSync(jsonFileName, JSON.stringify(promiseData));
});