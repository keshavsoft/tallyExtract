const getInventoryItems = ({ inVoucherRow, inInventoryKey }) => {

    const inventoryItems =
        inVoucherRow[inInventoryKey];

    if (!inventoryItems) {
        return [];
    }

    return Array.isArray(inventoryItems)
        ? inventoryItems
        : [inventoryItems];
};

export { getInventoryItems };