const insertAsIs = (mutate, tableName) => (record) =>
    mutate.insertAsIs({ table: tableName, record });

const insertFlat = (mutate, tableName) => (record) =>
    mutate.insertFlat({ table: tableName, record });

const insertGenPk = (mutate, tableName) => (record) =>
    mutate.insertGenPk({ table: tableName, record });

const insertWithChecks = (mutate, tableName) => (record) =>
    mutate.insertWithChecks({ table: tableName, record });

const deleteWithChecks = (mutate, tableName) => (pk) =>
    mutate.deleteWithChecks({ table: tableName, pk });

const updateWithChecks = (mutate, tableName) => (pk, record) =>
    mutate.updateWithChecks({ table: tableName, pk, record });

const buildMutate = (mutate, tableName) => ({
    insertAsIs: insertAsIs(mutate, tableName),
    insertFlat: insertFlat(mutate, tableName),
    insertGenPk: insertGenPk(mutate, tableName),
    insertWithChecks: insertWithChecks(mutate, tableName),
    deleteWithChecks: deleteWithChecks(mutate, tableName),
    updateWithChecks: updateWithChecks(mutate, tableName)
});

export default buildMutate;