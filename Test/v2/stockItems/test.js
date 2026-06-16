import load from "../../../index.js";

const api = await load();

api.stockItems({
    inSvCurrentCompany: "me"
}).then(promiseData => {
    console.log("stockItemsData : ", promiseData);
});