export default (col, value) => {
    if (value == null) return;

    if (col.type === "text" && typeof value !== "string") {
        throw new Error(`${col.field} must be string`);
    }

    if (col.type === "number" && typeof value !== "number") {
        throw new Error(`${col.field} must be number`);
    }

    if (col.type === "boolean" && typeof value !== "boolean") {
        throw new Error(`${col.field} must be boolean`);
    }
};