import { sendToTally } from "../core/impotToTally.js";
import { startFunc as PrepareDataObject } from "../api/PrepareDataObject/entryFile.js";

import { validateImportVoucherInput } from "./utils/validateInput.js";

const importVoucher = async (inClientData) => {
    validateImportVoucherInput(inClientData);   // 🔥 early fail

    const bodyToSend = PrepareDataObject({ inClientData });

    return await sendToTally(bodyToSend);

    return await true;
};

export { importVoucher };