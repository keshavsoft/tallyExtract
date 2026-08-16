import fs from "fs";
import { inventoryV4 } from "../../../index.js";

const jsonFileName = "purchases.json";

inventoryV4({ inSvCurrentCompany: "me" }).then(promiseData => {

    fs.writeFileSync(jsonFileName, JSON.stringify(promiseData));
});