# KeshavSoft

Simple tools. Clean architecture. Fast development.

---

## @keshavsoft/kschema

A lightweight schema-driven JSON database for Node.js.

---

## Install

npm i @keshavsoft/kschema

---

## Usage

import { kschema } from "@keshavsoft/kschema";

kschema.loadConfig({ dataPath: "./data" });

const users = kschema.table("users");

users.insert({ name: "keshav" });

const data = users.get();

console.log(data);

---

## API

Create

users.insert(record);
users.insertStrict(record);

Read

users.get();
users.findByPk(id);

Filter

users.filterByPk(id);
users.filterByColumns({ name: "keshav" });

Update

users.update(record);

Delete

users.delete(id);
users.deleteByColumns({ name: "keshav" });

---

## Features

* File-based JSON storage
* Schema-driven design
* Auto primary key
* Simple CRUD API
* Zero dependencies

---

## Links

GitHub: https://github.com/keshavsoft/kschema
NPM: https://www.npmjs.com/package/@keshavsoft/kschema
Website: https://keshavsoft.com

---

## Contact

Email: founder@keshavsoft.com

---

## About

KeshavSoft builds simple and practical developer tools focused on clarity, speed, and real-world usage.

---

## License

MIT License — see LICENSE file