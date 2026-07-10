import fs from "fs";
import { ledgersV2 } from "../../../index.js";

ledgersV2({ inSvCurrentCompany: "me" }).then(promiseData => {
    fs.writeFileSync("LedgerNames.json", JSON.stringify(promiseData));
});