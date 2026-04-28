export default (col, value) => {
    if (value == null) return;

    if (col.min != null && value < col.min) {
        throw new Error(`${col.field} must be >= ${col.min}`);
    }

    if (col.max != null && value > col.max) {
        throw new Error(`${col.field} must be <= ${col.max}`);
    }
};