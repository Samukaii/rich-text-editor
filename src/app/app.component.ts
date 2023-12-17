import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormatName, TextFormatterService } from "./text-formatter.service";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { Form } from "@angular/forms";

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, RouterOutlet, MatButtonModule, MatIconModule],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	@ViewChild('editor') editorRef!: ElementRef<HTMLElement>;
	formatter = inject(TextFormatterService);

	formats: {format: FormatName; icon: string}[] = [
		{
			icon: "format_bold",
			format: "bold"
		},
		{
			icon: "format_italic",
			format: "italic"
		},
		{
			icon: "format_strikethrough",
			format: "strikethrough"
		},
		{
			icon: "format_underlined",
			format: "underlined"
		},
	];

	get editor() {
		return this.editorRef.nativeElement;
	}

	applyFormat(format: FormatName) {
		this.formatter.applyFormat(format);

		this.normalizeEditor();
	}

	private normalizeEditor() {
		this.formatter.mergeAllAdjacentElements(this.editor);
	}
}
