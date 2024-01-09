import { Component, computed, inject, Input } from '@angular/core';
import { FormatOption } from "../../../models/format-option";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { CallPipe } from "../../../../../pipes/call.pipe";
import { ActiveFormatsService } from "../../../services/active-formats.service";
import { TextFormatterService } from "../../../services/text-formatter.service";
import { TextEditorComponent } from "../../../text-editor.component";

@Component({
	selector: 'app-text-editor-select-action',
	standalone: true,
	imports: [
		MatFormFieldModule,
		MatSelectModule,
		CallPipe
	],
	templateUrl: './text-editor-select-action.component.html',
	styleUrl: './text-editor-select-action.component.scss'
})
export class TextEditorSelectActionComponent {
	@Input({required: true}) format!: FormatOption<"select">;

	activeFormatsService = inject(ActiveFormatsService);
	formatter = inject(TextFormatterService);
	editor = inject(TextEditorComponent);

	actives = computed(() => this.activeFormatsService.activeFormats());

	activeItem = computed(() => {
		const all = this.actives();

		const active = all.find(active => active.name === this.format.name);

		if (!active) return "heading:remove";

		return this.format.name + active.options?.["level"];
	})

	applyFormat(item: FormatOption<"select">["items"][number]) {
		this.formatter.applyFormat(this.format.name, item.options);
		this.formatter.normalizeElement(this.editor.editor);
		this.activeFormatsService.updateActiveFormats();
	}

	removeFormat() {
		this.formatter.removeFormat(this.format.name)
	}


	getSelectValue(item: FormatOption<"select">["items"][number]) {
		return this.format.name + item.options?.['level'];
	}
}
