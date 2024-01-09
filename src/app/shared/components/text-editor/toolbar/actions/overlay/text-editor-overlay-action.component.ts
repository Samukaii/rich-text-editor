import { Component, computed, inject, Input } from '@angular/core';
import { ActiveFormatsService } from "../../../services/active-formats.service";
import { FormatOption } from "../../../models/format-option";
import {
	TextEditorOverlayActionDirective
} from "../../../app-text-editor-overlay-action/text-editor-overlay-action.directive";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TextFormatterService } from "../../../services/text-formatter.service";

@Component({
	selector: 'app-text-editor-overlay-action',
	standalone: true,
	imports: [
		TextEditorOverlayActionDirective,
		MatButtonModule,
		MatIconModule
	],
	templateUrl: './text-editor-overlay-action.component.html',
	styleUrl: './text-editor-overlay-action.component.scss'
})
export class TextEditorOverlayActionComponent {
	@Input({required: true}) format!: FormatOption<"overlay">;

	activeFormatsService = inject(ActiveFormatsService);
	formatter = inject(TextFormatterService);

	actives = computed(() => this.activeFormatsService.activeFormats());

	isFormatActive = computed(() => {
		const all = this.actives();

		return !!all.find(active => active.name === this.format.name)
	})
}
