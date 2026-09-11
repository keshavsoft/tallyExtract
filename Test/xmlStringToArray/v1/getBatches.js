const getBatches = (item) => {

    const batches =
        item["BATCHALLOCATIONS.LIST"];

    if (!batches) {
        return [];
    }

    return Array.isArray(batches)
        ? batches
        : [batches];
};

export { getBatches };