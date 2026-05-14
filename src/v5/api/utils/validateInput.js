// utils/validateInput.js
const validateImportVoucherInput = (data) => {
    if (!data || typeof data !== "object") {
        throw new Error("Input must be an object");
    }

    // 🔹 allinventoryentries
    if (!Array.isArray(data.allinventoryentries)) {
        throw new Error("allinventoryentries must be an array");
    }

    if (data.allinventoryentries.length === 0) {
        throw new Error("allinventoryentries cannot be empty");
    }

    // optional: validate one item structure
    const item = data.allinventoryentries[0];
    if (!item.ItemName || !item.Qty) {
        throw new Error("Invalid inventory item structure");
    }

    // 🔹 customerDetails
    if (!data.customerDetails || typeof data.customerDetails !== "object") {
        throw new Error("customerDetails must be an object");
    }

    if (!data.customerDetails.LedgerName) {
        throw new Error("LedgerName is required in customerDetails");
    }

    if (!data.customerDetails.InvoiceDate) {
        throw new Error("InvoiceDate is required in customerDetails");
    }
};

export { validateImportVoucherInput };