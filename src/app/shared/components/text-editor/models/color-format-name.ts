import { FormatName } from "./format.name";

export type ColorFormatName = Extract<FormatName, `color:${string}`>;
