export default (col, value) => {
    if (value == null || !col.pattern) return;

    const regex = new RegExp(col.pattern);
    if (!regex.test(value)) {
        throw new Error(`${col.field} format invalid`);
    }
};