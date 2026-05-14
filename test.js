import { importVoucher } from "./src/v7/api/importVoucher.js";

import BillsTableJson from "./Data/BillsTable.json" with {type: "json"};
import ItemsTableJson from "./Data/ItemsTable.json" with {type: "json"};

console.log("bbbbbbbb : ", BillsTableJson[0]);

importVoucher({
    customerDetails: BillsTableJson[0],
    allinventoryentries: ItemsTableJson
}).then(fromPromise => {
    console.log("fromPromise : ", fromPromise);
})