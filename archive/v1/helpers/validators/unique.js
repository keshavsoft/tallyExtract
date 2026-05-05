export default (col, value, tableData) => {
    if (!col.unique || value == null) return;

    const exists = tableData?.some(r => r[col.field] === value);
    if (exists) {
        throw new Error(`${col.field} must be unique`);
    }
};