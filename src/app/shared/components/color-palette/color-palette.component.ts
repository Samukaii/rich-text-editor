import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { MatRippleModule } from "@angular/material/core";
import { FormatOption } from "../../models/format-option";
import { GroupedFormatName } from "../../models/grouped-format-name";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: 'app-color-palette',
  standalone: true,
	imports: [
		MatIconModule,
		MatRippleModule,
		MatTooltipModule
	],
  templateUrl: './color-palette.component.html',
  styleUrl: './color-palette.component.scss'
})
export class ColorPaletteComponent {
	@Input({required: true}) colors!: FormatOption<1>["options"];
	@Input() selected?: GroupedFormatName;
	@Output() colorClick = new EventEmitter<GroupedFormatName>();

	getColorClass(colorOption: GroupedFormatName) {
		const color = colorOption.split(":")[1];

		return `color ${color}`
	}

}
