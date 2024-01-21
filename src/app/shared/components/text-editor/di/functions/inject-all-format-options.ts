import { inject } from "@angular/core";
import { defaultTextFormats } from "../../static/default-text-formats";
import { EDITOR_CUSTOM_FORMAT_OPTIONS_TOKEN } from "../tokens/editor-custom-format-options.token";

export const injectAllFormatOptions = () => {
	const custom = inject(EDITOR_CUSTOM_FORMAT_OPTIONS_TOKEN, {optional: true}) || [];

	const defaultWithoutCustom = defaultTextFormats.filter(format => {
		return !custom.find(customFormat => customFormat.name === format.name);
	})

	return [
		...defaultWithoutCustom,
		...custom
	];
}
