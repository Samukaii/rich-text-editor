import { FormatEditorValidOptionValue } from "./format-editor-valid-option.value";

export interface FormatEditorValidOptions {
	[key: string]: FormatEditorValidOptionValue | FormatEditorValidOptionValue[] | FormatEditorValidOptions;
}
