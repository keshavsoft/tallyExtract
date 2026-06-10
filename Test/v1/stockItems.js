import { stockItems } from "../../src/v8/api/stockItems.js";

stockItems({ inSvCurrentCompany: "me" }).then(promiseData => {
    console.log("stockItemsData : ", promiseData);
});