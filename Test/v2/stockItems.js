import { stockItems } from "../../src/v8/api/stockItems.js";

stockItems({ inSvCurrentCompany: "mani9" }).then(promiseData => {
    console.log("stockItemsData : ", promiseData);
});