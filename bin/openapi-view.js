#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const yamljs = require("yamljs");
const opener = require("opener");
const program = require("commander");

const COMMAND_NAME = "openapi-view";

program
  .option("--spec <spec.yml>", "API spec file")
  .option("--help", "show help")
  .action(work)
  .parse();

function outHelp() {
  `
  usage: ${COMMAND_NAME} [option]

  example:
  ${COMMAND_NAME} --spec spec.yml
  ${COMMAND_NAME} --help
  `.split("\n").forEach(line => {
    console.log(line);
  });
}

function work(options, command) {
  const specFile = options.spec;
  if(options.help || !specFile) {
    outHelp();
    return;
  }

  const tempDir = path.join(os.tmpdir(), "openapi-view");
  fs.mkdirSync(tempDir, { recursive: true });
  const indexHtmlFileName = path.join(tempDir, "index.html");
  const defJsFileName = path.join(tempDir, "spec.js");
  
  const indexHtmlContent = fs.readFileSync(path.join(__dirname, "../resources/index.html"), { encoding: "utf8" });
  fs.writeFileSync(indexHtmlFileName, indexHtmlContent);
  
  const yamlContent = fs.readFileSync(specFile, { encoding: "utf8" });
  const definitions = yamljs.parse(yamlContent);
  
  const defContent = `window.swaggerSpec = ${JSON.stringify(definitions, null, 2)}`;
  fs.writeFileSync(defJsFileName, defContent);
  
  opener(indexHtmlFileName);
}
