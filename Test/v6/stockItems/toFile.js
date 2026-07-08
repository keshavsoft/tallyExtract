import fs from "fs";
import { stockItemsV2 } from "../../../index.js";

stockItemsV2({ inSvCurrentCompany: "me" }).then(promiseData => {
    fs.writeFileSync("StockItems.json", JSON.stringify(promiseData));
});