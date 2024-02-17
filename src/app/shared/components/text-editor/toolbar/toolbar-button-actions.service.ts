import { computed, inject, Injectable } from '@angular/core';
import { EditorFormatName } from "../models/editor-format-name";
import { ActiveFormatsService } from "../services/active-formats.service";
import { TextFormatterService } from "../services/text-formatter.service";
import { TOOLBAR_BUTTON_OPTIONS_TOKEN } from "../di/tokens/toolbar-button-options.token";
import { EditorFormatOptions } from "../models/editor-format-options";

@Injectable()
export class ToolbarButtonActionsService<Format extends EditorFormatName = EditorFormatName> {
	private editor = inject(ActiveFormatsService);
	private formatter = inject(TextFormatterService);

	private options = inject(TOOLBAR_BUTTON_OPTIONS_TOKEN);

	private get editorElement() {
		return this.options.editorElement;
	}

	get name() {
		return this.options.name;
	}

	private formatActive = computed(() => {
		const all = this.editor.activeFormats();

		return all.find(active => active.name === this.name);
	})

	isActive = computed(() => !!this.formatActive());

	activeOptions = computed(() => {
		const active = this.formatActive();

		if (!active) return null;

		return active.options as EditorFormatOptions<Format>;
	});

	applyFormat(formatOptions?: EditorFormatOptions<Format>) {
		this.editorElement.focus();
		this.formatter.applyFormat(this.name, formatOptions);
		this.editor.updateActiveFormats();
		this.formatter.normalizeElement(this.editorElement);
	}

	removeFormat() {
		this.formatter.removeFormat(this.name);
		this.editor.updateActiveFormats();
		this.formatter.normalizeElement(this.editorElement);
	}
}
