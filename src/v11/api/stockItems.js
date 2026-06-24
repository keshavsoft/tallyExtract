import { sendToTally } from "../core/sendToTally.js";

export function stockItems() {
    return sendToTally("KeshavStockItems");
};