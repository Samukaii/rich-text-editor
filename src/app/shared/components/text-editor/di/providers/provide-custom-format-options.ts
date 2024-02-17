import { Provider } from "@angular/core";
import { CustomFormat } from "../../models/custom-format";
import { EDITOR_CUSTOM_FORMAT_OPTIONS_TOKEN } from "../tokens/editor-custom-format-options.token";

export const provideCustomFormatOptions = (formatOptions: CustomFormat[]): Provider[] => {
	return [
		{
			provide: EDITOR_CUSTOM_FORMAT_OPTIONS_TOKEN,
			useValue: formatOptions
		}
	]
}
