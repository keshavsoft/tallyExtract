import { stockItemsV1 } from "../../../index.js";

stockItemsV1({ inSvCurrentCompany: "me" }).then(promiseData => {
    console.log("stockItemsData : ", promiseData);
});