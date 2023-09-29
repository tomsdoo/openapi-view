#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const yamljs = require("yamljs");

const argv = process.argv.slice(2);

const tempDir = path.join(os.tmpdir(), "ad-hoc-open-api");
fs.mkdirSync(tempDir, { recursive: true });
const indexHtmlFileName = path.join(tempDir, "index.html");
const defJsFileName = path.join(tempDir, "spec.js");

const indexHtmlContent = fs.readFileSync(path.join(__dirname, "../resources/index.html"), { encoding: "utf8" });
fs.writeFileSync(indexHtmlFileName, indexHtmlContent);

const yamlContent = fs.readFileSync(argv[0], { encoding: "utf8" });
const definitions = yamljs.parse(yamlContent);

const defContent = `window.swaggerSpec = ${JSON.stringify(definitions, null, 2)}`;
fs.writeFileSync(defJsFileName, defContent);

console.log(tempDir);
