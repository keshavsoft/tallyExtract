export default (col, value) => {
    if (value == null || !col.enum) return;

    if (!col.enum.includes(value)) {
        throw new Error(`${col.field} must be one of ${col.enum.join(", ")}`);
    }
};