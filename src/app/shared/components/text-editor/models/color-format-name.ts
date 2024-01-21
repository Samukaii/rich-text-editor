import { EditorFormatName } from "./editor-format-name";

export type ColorFormatName = Extract<EditorFormatName, `color:${string}`>;
