import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormatName, TextFormatterService } from "./text-formatter.service";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatRippleModule } from "@angular/material/core";

export type ColorFormatName = Extract<FormatName, `color:${string}`>;

export type FormatOption = {
	type: "palette",
	options: ColorFormatName[]
} |
	{
		type: "button",
		name: FormatName,
		icon: string
	}


@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, RouterOutlet, MatButtonModule, MatIconModule, MatRippleModule],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	@ViewChild('editor') editorRef!: ElementRef<HTMLElement>;
	formatter = inject(TextFormatterService);

	formats: FormatOption[] = [
		{
			type: "button",
			icon: "format_bold",
			name: "bold",
		},
		{
			type: "button",

			icon: "format_italic",
			name: "italic",
		},
		{
			type: "button",

			icon: "format_strikethrough",
			name: "strikethrough",
		},
		{
			type: "button",

			icon: "format_underlined",
			name: "underlined",
		},
		{
			type: "palette",
			options: [
				"color:red",
				"color:green",
				"color:blue",
				"color:blue",
				"color:blue",
				"color:blue",
				"color:blue",
				"color:blue",
				"color:blue",
				"color:purple",
			]
		},
	];

	get editor() {
		return this.editorRef.nativeElement;
	}

	getColorClass(colorOption: ColorFormatName) {
		return colorOption.replace(":", " ");
	}

	applyFormat(actionName: FormatName) {
		this.formatter.applyFormat(actionName);

		this.formatter.normalizeElement(this.editor)
	}
}
