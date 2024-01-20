import { EditorFormatName } from "./editor-format-name";
import { Generic } from "./generic";

export type EditorFormatOptions<Name extends EditorFormatName> =
	AllEditorFormats[Name] extends {options: Generic}
	? AllEditorFormats[Name]["options"]
	: Generic | undefined;

export type EditorAction = {
	[k in EditorFormatName]: AllEditorFormats[k] extends {options: string | number | boolean}
		? k | `${k}:${AllEditorFormats[k]["options"]}`
		: k
}[EditorFormatName]

