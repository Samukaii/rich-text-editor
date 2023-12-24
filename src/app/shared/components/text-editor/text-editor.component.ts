import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { FormatName, TextFormatterService } from "./services/text-formatter.service";
import { MatRippleModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormatOption } from "../../models/format-option";
import { TextEditorToolbarComponent } from "./toolbar/text-editor-toolbar.component";
import { ActiveFormatsService } from "./services/active-formats.service";

@Component({
	selector: 'app-text-editor',
	standalone: true,
	imports: [
		MatRippleModule,
		MatButtonModule,
		MatIconModule,
		TextEditorToolbarComponent
	],
	templateUrl: './text-editor.component.html',
	styleUrl: './text-editor.component.scss'
})
export class TextEditorComponent {
	formatter = inject(TextFormatterService);
	activeFormats = inject(ActiveFormatsService);

	@ViewChild('editor') editorRef!: ElementRef<HTMLElement>;
	@Input() formats: FormatOption[] = [];

	get editor() {
		return this.editorRef.nativeElement;
	}

	applyFormat(actionName: FormatName) {
		this.formatter.applyFormat(actionName);

		this.formatter.normalizeElement(this.editor)

		this.activeFormats.updateActiveFormats()
	}
}
