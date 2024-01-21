import { Component, computed, input } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { MatRippleModule } from "@angular/material/core";
import { MatTooltipModule } from "@angular/material/tooltip";
import { JsonPipe } from "@angular/common";
import { EditorFormatName } from "../text-editor/models/editor-format-name";
import { injectToolbarButtonOptions } from "../text-editor/di/functions/inject-toolbar-button-options";

@Component({
  selector: 'app-color-palette',
  standalone: true,
	imports: [
		MatIconModule,
		MatRippleModule,
		MatTooltipModule,
		JsonPipe
	],
  templateUrl: './color-palette.component.html',
  styleUrl: './color-palette.component.scss'
})
export class ColorPaletteComponent {
	editor = input.required<ReturnType<typeof injectToolbarButtonOptions<"color" | "background-color">>>();
	format = input.required<EditorFormatName>();
	colors = input.required<{
		tooltip: string;
		color: string;
	}[]>();

	isSelected = (color: string) => computed(() => {
		return this.editor().activeOptions()?.color === color;
	})

	allDeselected = computed(() => {
		return !this.editor().isActive();
	})

}
