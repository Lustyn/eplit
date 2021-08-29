#!/usr/bin/env node
import { log, panic } from "./utils";
import { eplit } from "./eplit";
import * as fs from "fs/promises";

async function main() {
    if (process.argv.length < 3) panic("Usage: eplit <file>");

    const file = process.argv[2];
    log(`Reading config from ${file}`);
    const eplitFile = JSON.parse(await fs.readFile(file, "utf8"));

    await eplit(eplitFile);
}

main().catch(panic);