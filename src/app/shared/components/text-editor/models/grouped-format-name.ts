import { FormatName } from "./format.name";

export type GroupedFormatName = Extract<FormatName, `${string}:${string}`>;
