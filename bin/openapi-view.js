#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const yamljs = require("yamljs");
const httpServer = require("http-server");
const portfinder = require("portfinder");
const opener = require("opener");
const { Command }= require("commander");
const program = new Command();

const COMMAND_NAME = "openapi-view";

program
  .option("--spec <spec.yml>", "API spec file")
  .option("-p --port <port>", "port to listen")
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

async function work(options, command) {
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

  const port = Number(options.port) || await portfinder.getPortPromise();

  const server = httpServer.createServer({
    root: tempDir,
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`opening ${url}`);
    opener(url);
  });
}
