export default (col, value) => {
    if ((col.isInput || col.primary) && (value === undefined || value === null || value === "")) {
        throw new Error(`${col.field} is required`);
    }
};