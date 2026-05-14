// src/v1/api/stockItems.js
import { sendToTally } from "../core/sendToTally.js";

export function stockItems() {
    return sendToTally("KeshavStockItems");
};