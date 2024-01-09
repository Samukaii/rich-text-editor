import { EditorFormatName } from "./editor-format-name";
import { Generic } from "./generic";

export type EditorFormatOptions<Name extends EditorFormatName> =
	AllEditorFormats[Name] extends {options: Generic}
	? AllEditorFormats[Name]["options"]
	: Generic | undefined;
