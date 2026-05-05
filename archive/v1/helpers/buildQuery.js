import * as aggregate from "../engine/query/aggregate/index.js";

const findAll = (query, tableName) => () =>
    query.findAll({ table: tableName });

const findByPk = (query, tableName) => (id) =>
    query.findByPk({ table: tableName, id });

const filterByPk = (query, tableName) => (id) =>
    query.filterByPk({ table: tableName, id });

const filterByColumns = (query, tableName) => (where) =>
    query.filterByColumns({ table: tableName, where });

const buildQuery = (query, tableName) => ({
    findAll: findAll(query, tableName),
    findByPk: findByPk(query, tableName),
    filterByPk: filterByPk(query, tableName),
    filterByColumns: filterByColumns(query, tableName),

    aggregate: {
        count: () =>
            query.aggregate.count({ table: tableName })
    }
});

export default buildQuery;
