export const getPrimaryKey = (columns) => {
    const pkColumn = columns.find(c => c.primary);
    if (!pkColumn) throw new Error("Primary key not defined");
    return pkColumn.field;
};

export const attachPrimaryKey = (record, pk, data) => {
    let maxId = 0;

    for (const row of data) {
        const val = Number(row[pk]) || 0;
        if (val > maxId) maxId = val;
    }

    return {
        ...record,
        [pk]: maxId + 1
    };
};