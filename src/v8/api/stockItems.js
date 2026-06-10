// src/v1/api/stockItems.js
import { sendToTally } from "../core/sendToTally.js";

export function stockItems({ inSvCurrentCompany }) {
    // return sendToTally("KeshavStockItems");

    return sendToTally({
        inTdlName: "KeshavStockItems",
        inSvCurrentCompany
    });
};