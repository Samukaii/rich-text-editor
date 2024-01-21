import { EditorFormatName } from "./editor-format-name";
import { Generic } from "./generic";
import { AllEditorFormats } from "./all-editor-formats";

export type EditorFormatOptions<Name extends EditorFormatName> =
	AllEditorFormats[Name] extends {options: Generic}
	? AllEditorFormats[Name]["options"]
	: Generic | undefined;


