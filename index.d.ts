export interface TableQueryAPI {
  findAll: (...args: any[]) => any;
  findByPk: (...args: any[]) => any;
}

export interface TableMutateAPI {
  insertWithChecks: (...args: any[]) => any;
  insertGenPk: (...args: any[]) => any;
}

export interface TableAPI {
  query: TableQueryAPI;
  mutate: TableMutateAPI;
}

export interface KSchema {
  loadConfig: (config: any) => void;
  getConfig: () => any;
  table: (tableName: string) => TableAPI;
}

export const kschema: KSchema;
export const schemaMeta: any;
export const argsSchema: any;
export const descSchema: any;
export const exampleSchema: any;
