import { Component, computed, inject, Input, OnInit } from '@angular/core';
import { FormatOption } from "../../../models/format-option";
import { ActiveFormatsService } from "../../../services/active-formats.service";
import { TextFormatterService } from "../../../services/text-formatter.service";
import { Generic } from "../../../models/generic";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { TextEditorComponent } from "../../../text-editor.component";
import { FormatHelperService } from "../../../services/format-helper/format-helper.service";

@Component({
	selector: 'app-text-editor-button-action',
	standalone: true,
	imports: [
		MatButtonModule,
		MatTooltipModule,
		MatIconModule
	],
	templateUrl: './text-editor-button-action.component.html',
	styleUrl: './text-editor-button-action.component.scss'
})
export class TextEditorButtonActionComponent {
	@Input({required: true}) format!: FormatOption<"button">;

	activeFormatsService = inject(ActiveFormatsService);
	formatter = inject(TextFormatterService);
	editor = inject(TextEditorComponent);
	helper = inject(FormatHelperService);

	actives = computed(() => this.activeFormatsService.activeFormats());

	isFormatActive = computed(() => {
		const all = this.actives();

		const active = all.find(active => active.name === this.format.name);

		if(!active) return false;

		if(!active.options) return true;

		return this.helper.compareOptions(active.options, this.format.options || {})
	})

	applyFormat() {
		this.formatter.applyFormat(this.format.name, this.format.options);
		this.formatter.normalizeElement(this.editor.editor);
		this.activeFormatsService.updateActiveFormats();
	}

}
