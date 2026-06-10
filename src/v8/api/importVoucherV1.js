import { sendToTally } from "../core/impotToTally.js";
import prepareDataObject from "./PrepareDataObjectV1/entryFile.js";

import { validateImportVoucherInput } from "./utils/validateInput.js";

const importVoucher = async (inClientData) => {
    validateImportVoucherInput(inClientData);   // 🔥 early fail

    const bodyToSend = prepareDataObject({ inClientData });

    return await sendToTally(bodyToSend);

    return await true;
};

export { importVoucher };