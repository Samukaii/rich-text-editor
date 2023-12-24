import { FormatName } from "../components/text-editor/services/text-formatter.service";

export type GroupedFormatName = Extract<FormatName, `${string}:${string}`>;
