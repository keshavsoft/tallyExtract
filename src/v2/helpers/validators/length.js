export default (col, value) => {
    if (value == null || typeof value !== "string") return;

    if (col.minLength != null && value.length < col.minLength) {
        throw new Error(`${col.field} min length ${col.minLength}`);
    }

    if (col.maxLength != null && value.length > col.maxLength) {
        throw new Error(`${col.field} max length ${col.maxLength}`);
    }
};