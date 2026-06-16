// src/v1/api/stockItems.js
import { sendToTally } from "../core/sendToTallyV1.js";

export function stockItemsV1({ inSvCurrentCompany }) {
    // return sendToTally("KeshavStockItems");

    return sendToTally({
        inTdlName: "KeshavStockItems",
        inSvCurrentCompany
    });
};