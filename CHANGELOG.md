# CHANGELOG

All notable changes to this project will be documented in this file.

---

## [1.7.1] - 2026-04-18

### Added

* Initial release of kschema
* Config loader (`loadConfig`, `getConfig`)
* File-based JSON storage
* Schema-driven table handling
* Primary key detection (`getPrimaryKey`)
* Auto-increment primary key (`attachPrimaryKey`)
* CRUD operations:

  * insert
  * insertStrict
  * get
  * findByPk
  * update
  * delete

### Notes

* Primary key is dynamically resolved from schema
* Data stored as JSON files
* Minimal, dependency-free design

## [1.7.3] - 2026-04-19

### filer and find columns perfect

## [1.7.4]

### delete multi added

