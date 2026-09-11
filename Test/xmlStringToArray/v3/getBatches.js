const getBatches = ({ item, inBatchKey }) => {

    const batches =
        item[inBatchKey];

    if (!batches) {
        return [];
    }

    return Array.isArray(batches)
        ? batches
        : [batches];
};

export { getBatches };