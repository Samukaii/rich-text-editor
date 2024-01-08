import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { MatRippleModule } from "@angular/material/core";
import { MatTooltipModule } from "@angular/material/tooltip";
import { OVERLAY_DATA_TOKEN } from "../../services/overlay-creator/overlay-data.token";
import { JsonPipe } from "@angular/common";
import { TextFormatterService } from "../text-editor/services/text-formatter.service";
import { ActiveFormatsService } from "../text-editor/services/active-formats.service";

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
	data = inject<{
		options: {
			format: string;
			colors: {
				tooltip: string;
				color: string;
			}[]
		}
	}>(OVERLAY_DATA_TOKEN);

	formatter = inject(TextFormatterService);
	activeFormats = inject(ActiveFormatsService);


	applyColor(color: string) {
		this.formatter.applyFormat(this.data.options.format, {color})
	}

	removeColor() {
		this.formatter.applyFormat(this.data.options.format, {remove: true});
	}

	isSelected = (color: string) => computed(() => {
		const actives = this.activeFormats.activeFormats();

		const active = actives.find(active => active.name === this.data.options.format);

		if(!active) return false;

		return active.options?.['color'] === color;
	})

	allDeselected = computed(() => {
		const actives = this.activeFormats.activeFormats();
		const allColors = this.data.options.colors.map(color => color.color);

		const active = actives.find(active => active.name === this.data.options.format);

		if(!active) return true;

		return !allColors.includes(active.options?.['color']);
	})

}
