import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormatOption } from "../models/format-option";
import { GroupedFormatName } from "../models/grouped-format-name";
import { ColorPaletteTriggerDirective } from "../../color-palette/color-palette-trigger.directive";

@Component({
  selector: 'app-text-editor-color-action',
  standalone: true,
	imports: [
		MatButtonModule,
		MatIconModule,
		ColorPaletteTriggerDirective
	],
  templateUrl: './text-editor-color-action.component.html',
  styleUrl: './text-editor-color-action.component.scss'
})
export class TextEditorColorActionComponent {
	@Input() icon = "format_color_text";
	@Input({required: true}) colors!:  FormatOption<1>["options"];
	@Input() selected?: GroupedFormatName;
	@Output() formatClick = new EventEmitter<GroupedFormatName>();

	getColorClass(colorOption?: GroupedFormatName) {
		const color = colorOption?.split(":")[1];
		if(!color) return "";

		return `color ${color}`
	}
}
