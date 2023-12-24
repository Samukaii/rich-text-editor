import { FormatName } from "../components/text-editor/services/text-formatter.service";

export type ColorFormatName = Extract<FormatName, `color:${string}`>;
