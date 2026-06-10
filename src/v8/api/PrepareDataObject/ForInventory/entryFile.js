import path from "path";
import { fileURLToPath } from "url";
import { startFunc as prepareInventory } from "./prepareInventory.js";
// --------------------------------------------------

// Creates inventory entries array from items.json
const startFunc = ({ inItemsJsonAsArray }) => {
    let LocalArray = [];
    const LocalInItemsJsonAsArray = inItemsJsonAsArray;

    return LocalInItemsJsonAsArray.map(element => {
        return prepareInventory({
            inItemName: element.ItemName,
            inTaxPer: element.TaxPer,
            inUom: element.Uom,
            inRate: element.Rate,
            inQty: element.Qty
        });
    });

    return CommonFileDataAsJson;
};

export { startFunc };