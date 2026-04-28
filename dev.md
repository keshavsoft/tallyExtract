# @keshavsoft/kschema

A minimal config store for loading and accessing JSON configuration across your application.

---

## 🚀 Installation

```bash
npm install @keshavsoft/kschema
```

---

## 📦 Usage

```js
import { loadConfig, getConfig } from "@keshavsoft/kschema";

loadConfig({ name: "test" });

console.log(getConfig());
```

---

## 🧠 API

### loadConfig(config)

Loads the configuration into memory.

* `config` → Object

---

### getConfig()

Returns the loaded configuration.

* Throws error if config is not loaded

---

## ⚠️ Notes

* Config is stored in-memory
* Must call `loadConfig` before `getConfig`

---

## 📌 Example

```js
loadConfig({ user: "keshav" });

const data = getConfig();

console.log(data.user); // keshav
```

---

## 🛠 Future Scope

* Validation support
* Config updates
* Remote config loading

---

## 👨‍💻 Author

KeshavSoft
