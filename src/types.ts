export interface EplitSegment {
    from?: string;
    to?: string;
    id: string;
    name?: string;
};

export interface EplitInput {
    filename: string;
    segments: EplitSegment[];
};

export interface EplitOutput {
    filename: string;
    segments: string[];
    chapters?: boolean;
};

export interface EplitFile {
    inputs: EplitInput[],
    outputs: EplitOutput[]
};

export interface EplitSegmentFile {
    filename: string;
    index: number;
    id: string;
    from: string;
    to: string;
    name?: string;
};