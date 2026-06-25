import { stockItemsV2 } from "../../../index.js";

stockItemsV2({ inSvCurrentCompany: "me" }).then(promiseData => {
    console.log("stockItemsData : ", promiseData[0]);
});