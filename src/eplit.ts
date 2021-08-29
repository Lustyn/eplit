import * as fs from "fs/promises";
import { format } from "util";
import { convertTimestamp, debug, duration, log, mediaDuration, mkvMerge, mkvSplit, padChapter } from "./utils";
import { EplitFile, EplitSegmentFile } from "./types";

export async function eplit(file: EplitFile): Promise<void> {
    const segmentMap = new Map<string, EplitSegmentFile>();

    for (let i = 0; i < file.inputs.length; i++) {
        const segmentFormat = `temp-split-%s-%s.mkv`;
        const input = file.inputs[i];
        const segments: [string, string][] = [];

        for (let k = 0; k < input.segments.length; k++) {
            const segment = input.segments[k];

            const from = segment.from ?? input.segments[k - 1]?.to ?? "00:00:00.000";
            const to = segment.to ?? input.segments[k + 1]?.from ?? await mediaDuration(input.filename);

            segments.push([from, to]);

            const segmentFilename = format(segmentFormat, input.filename, k + 1);
            segmentMap.set(segment.id, {
                filename: segmentFilename,
                index: k,
                id: segment.id,
                name: segment.name,
                from, to
            });
        }

        log(`Splitting ${input.filename}`);
        await mkvSplit(input.filename, format(segmentFormat, input.filename, "%d"), segments);
    };

    for (const output of file.outputs) {
        const segmentFiles = output.segments.map(id => {
            const segment = segmentMap.get(id);
            if (!segment) throw new Error(`Segment ${id} not found`);
            return segment;
        });

        const files = segmentFiles.map(segment => segment.filename);
        let chapterFile: string | undefined;

        if (output.chapters ?? true) {
            const chapters = [];
            let chapterCount = 0;
            let timestamp = 0;
            
            for (const file of segmentFiles) {
                if (file.name) {
                    const chapterId = padChapter(chapterCount);
                    chapters.push(`CHAPTER${chapterId}=${convertTimestamp(timestamp)}`);
                    chapters.push(`CHAPTER${chapterId}NAME=${file.name}`);
                    chapterCount++;
                }
                timestamp += duration(file.from, file.to);
            }

            chapterFile = `temp-chapters-${output.filename}.txt`;
            await fs.writeFile(chapterFile, chapters.join("\n"));
        };

        log(`Merging ${output.filename}`);
        await mkvMerge(output.filename, files, chapterFile ? ["--chapters", chapterFile] : []);
        if (chapterFile) {
            debug(`Deleting ${chapterFile}`);
            await fs.unlink(chapterFile);
        }
    };

    for (const file of segmentMap.values()) {
        debug(`Deleting ${file.filename}`);
        await fs.unlink(file.filename);
    };

    log("Done!");
};