import { ledgersV2 } from "../../../index.js";

ledgersV2({ inSvCurrentCompany: "me" }).then(promiseData => {
    console.log("stockItemsData : ", promiseData[0]);
});