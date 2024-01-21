import { Provider } from "@angular/core";
import { EditorFormat } from "../../models/editor.format";
import { EDITOR_CUSTOM_FORMAT_OPTIONS_TOKEN } from "../tokens/editor-custom-format-options.token";

export const provideCustomFormatOptions = (formatOptions: EditorFormat[]): Provider[] => {
	return [
		{
			provide: EDITOR_CUSTOM_FORMAT_OPTIONS_TOKEN,
			useValue: formatOptions
		}
	]
}
