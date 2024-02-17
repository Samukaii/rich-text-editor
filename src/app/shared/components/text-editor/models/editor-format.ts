import { EditorFormatName } from "./editor-format-name";
import { EditorFormatOptions } from "./editor-format-options";

type FormatMap<T extends EditorFormatName> = undefined extends EditorFormatOptions<T> ? {
	name: T;
} : {
	name: T;
	options: EditorFormatOptions<T>;
}

export type EditorFormat<T extends EditorFormatName = EditorFormatName> = T extends EditorFormatName ? FormatMap<T> : never;
