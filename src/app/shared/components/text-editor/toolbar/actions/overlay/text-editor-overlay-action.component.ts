import { Component, computed, inject, input, Input } from '@angular/core';
import { ActiveFormatsService } from "../../../services/active-formats.service";
import { FormatOption } from "../../../models/format-option";
import {
	TextEditorOverlayActionDirective
} from "../../../app-text-editor-overlay-action/text-editor-overlay-action.directive";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TextFormatterService } from "../../../services/text-formatter.service";
import { TextEditorComponent } from "../../../text-editor.component";
import { CallPipe } from "../../../../../pipes/call.pipe";

@Component({
	selector: 'app-text-editor-overlay-action',
	standalone: true,
	imports: [
		TextEditorOverlayActionDirective,
		MatButtonModule,
		MatIconModule,
		CallPipe
	],
	templateUrl: './text-editor-overlay-action.component.html',
	styleUrl: './text-editor-overlay-action.component.scss'
})
export class TextEditorOverlayActionComponent {
	test = input.required<FormatOption<"overlay">>()

	activeFormatsService = inject(ActiveFormatsService);
	formatter = inject(TextFormatterService);
	editor = inject(TextEditorComponent);

	actives = computed(() => this.activeFormatsService.activeFormats());

	isFormatActive = computed(() => {
		const all = this.actives();

		return false;
	});

	getOptions(format: FormatOption<"overlay">) {
		return {
			editor: this.editor,
			...(format.overlay.options || {}),
		}
	}
}
