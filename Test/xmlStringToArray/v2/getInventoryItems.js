const getInventoryItems = (VOUCHER) => {

    const inventoryItems =
        VOUCHER["ALLINVENTORYENTRIES.LIST"];

    if (!inventoryItems) {
        return [];
    }

    return Array.isArray(inventoryItems)
        ? inventoryItems
        : [inventoryItems];
};

export { getInventoryItems };