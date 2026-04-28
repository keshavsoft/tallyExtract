export default (col, record) => {
    if (record[col.field] == null && col.defaultValue !== undefined) {
        record[col.field] = col.defaultValue;
    }
};