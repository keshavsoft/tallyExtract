export const validateRecord = (record, columns, data) => {
    columns.forEach(col => {
        const value = record[col.field];

        if (col.required && (value === undefined || value === null || value === "")) {
            throw new Error(`${col.field} is required`);
        }

        if (value === undefined) return;

        if (col.unique && data.some(r => r[col.field] === value)) {
            throw new Error(`${col.field} must be unique`);
        }
    });
};

export const validateFilterKeys = (filter, columns) => {
    const validColumns = columns.map(col => col.field);

    const invalidKeys = Object.keys(filter).filter(
        key => !validColumns.includes(key)
    );

    if (invalidKeys.length > 0) {
        throw new Error(`Invalid columns: ${invalidKeys.join(", ")}`);
    };
};