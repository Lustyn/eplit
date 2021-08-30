import { spawn } from "child_process";
import { debuglog } from "util";

export const log = (msg: string) => console.log("eplit:", msg);
export const debug = debuglog("eplit");

export const run = (cmd: string, args: string[]): Promise<void> => {
    debug(`$ ${cmd} ${args.join(" ")}`);
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, { stdio: "inherit" });

        child.on("exit", (code) => {
            if (code === 0) {
                debug(`${cmd} exited with code ${code}`);
                resolve();
            } else {
                debug(`Error: ${cmd} exited with code ${code}`);
                reject(code);
            }
        });
    });
};

export const exec = (cmd: string, args: string[]): Promise<string> => {
    debug(`$ ${cmd} ${args.join(" ")}`);
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args);
        let output = "";

        child.stdout.on("data", (data) => output += data);
        child.stderr.pipe(process.stderr);

        child.on("exit", (code) => {
            if (code === 0) {
                debug(`${cmd} exited with code ${code}`);
                resolve(output);
            } else {
                debug(`Error: ${cmd} exited with code ${code}`);
                reject(code);
            }
        });
    });
};

export const panic = (message: string): never => (console.error(message), process.exit(1));

export const pad = (num: number, size: number): string => num.toString().padStart(size, "0");
export const padChapter = (id: number) => pad(id, 2);

const TIMESTAMP_REGEX = /^([0-9]{1,2})?:?([0-9]{2}):([0-9]{2}(?:\.[0-9]*)?)$/;

export const parseTimestamp = (timestamp: string): number => {
    if (timestamp === "") return 0;
    const matches = timestamp.match(TIMESTAMP_REGEX);
    if (matches == null) throw new Error("Invalid timestamp: " + timestamp);
    let secs = parseFloat(matches[1] ?? "0") * 60 * 60; // hours
    secs += parseFloat(matches[2] ?? "0") * 60; // mins
    secs += parseFloat(matches[3] ?? "0");
    return secs;
};

export const convertTimestamp = (time: number) => {
    const hours = pad(Math.floor(time / 60 / 60), 2);
    const minutes = pad(Math.floor(time / 60) % 60, 2);
    const seconds = pad(Math.floor((time) % 60), 2);
    const milliseconds = pad(Math.floor((time % 1) * 1000), 3);
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export const duration = (from: string, to: string): number => {
    const startTime = parseTimestamp(from) ?? 0;
    const endTime = parseTimestamp(to) ?? 0;
    return endTime - startTime;
}

export function mkvSplit(input: string, output: string, segments: [string, string][]) {
    return run("mkvmerge", [
        "-q",
        "-o", output,
        "--split", "parts:" + segments.map(s => s.join("-")).join(","),
        input
    ]);
};

export function mkvMerge(output: string, files: string[], flags: string[] = [], fileFlags: string[] = []) {
    return run("mkvmerge", [
        "-q",
        ...flags,
        "-o", output,
        ...fileFlags,
        "[", ...files, "]"
    ]);
};

export async function mediaDuration(file: string): Promise<string> {
    const duration = await exec("mediainfo", ["--Output=General;%Duration%", file]);
    const time = parseFloat(duration) / 1000;
    return convertTimestamp(time);
};