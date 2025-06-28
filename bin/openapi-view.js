#!/usr/bin/env node
"use strict";

import fs from "fs";
import path from "path";
import os from "os";
import yamljs from "yamljs";
import httpServer from "http-server";
import portfinder from "portfinder";
import opener from "opener";
import { fileURLToPath } from "url";
import { Command } from "commander";

const program = new Command();

const COMMAND_NAME = "openapi-view";

program
  .option("--spec <spec file>", "API spec file")
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

  const indexHtmlPath = fileURLToPath(new URL("../resources/index.html", import.meta.url));
  const indexHtmlContent = fs.readFileSync(indexHtmlPath, { encoding: "utf8" });
  fs.writeFileSync(indexHtmlFileName, indexHtmlContent);

  const definitions = (() => {
    const ext = path.extname(specFile);
    const isSpecYaml = /\.ya?ml/i.test(ext);
    if (isSpecYaml) {
      const yamlContent = fs.readFileSync(specFile, { encoding: "utf8" });
      return yamljs.parse(yamlContent);
    }
    const isSpecJson = /\.json/i.test(ext);
    if (isSpecJson) {
      const jsonContent = fs.readFileSync(specFile, { encoding: "utf8" });
      return JSON.parse(jsonContent);
    }
    throw new Error("spec file extention is invalid");
  })();
  
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
