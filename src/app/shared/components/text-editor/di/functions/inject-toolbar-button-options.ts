import { computed, inject } from "@angular/core";
import { EditorFormatName } from "../../models/editor-format-name";
import { ActiveFormatsService } from "../../services/active-formats.service";
import { TextFormatterService } from "../../services/text-formatter.service";
import { TOOLBAR_BUTTON_OPTIONS_TOKEN } from "../tokens/toolbar-button-options.token";
import { EditorFormatOptions } from "../../models/editor-format-options";

export const injectToolbarButtonOptions = <Format extends EditorFormatName = EditorFormatName>() => {
	const editor = inject(ActiveFormatsService);
	const formatter = inject(TextFormatterService);

	const { name,  editorElement } = inject(TOOLBAR_BUTTON_OPTIONS_TOKEN);

	const formatActive = computed(() => {
		const all = editor.activeFormats();

		return all.find(active => active.name === name);
	})

	const isActive = computed(() => !!formatActive())

	const activeOptions = computed(() => {
		const active = formatActive();

		if (!active) return null;

		return active.options as EditorFormatOptions<Format>;
	});

	return {
		name,
		isActive,
		activeOptions,
		removeFormat: () => {
			formatter.removeFormat(name);
			editor.updateActiveFormats();
			formatter.normalizeElement(editorElement);
		},
		applyFormat: (formatOptions?: EditorFormatOptions<Format>) => {
			editorElement.focus();
			formatter.applyFormat(name, formatOptions);
			editor.updateActiveFormats();
			formatter.normalizeElement(editorElement);
		}
	}
};
