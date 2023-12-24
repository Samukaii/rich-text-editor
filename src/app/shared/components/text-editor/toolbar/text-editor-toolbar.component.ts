import { Component, computed, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatRippleModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormatOption } from "../models/format-option";
import { MatSelectModule } from "@angular/material/select";
import { ActiveFormatsService } from "../services/active-formats.service";
import { JsonPipe } from "@angular/common";
import { CallPipe } from "../../../pipes/call.pipe";
import { ColorPaletteComponent } from "../../color-palette/color-palette.component";
import { GroupedFormatName } from "../models/grouped-format-name";
import { TextEditorColorActionComponent } from "../color-action/text-editor-color-action.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormatName } from "../models/format.name";

@Component({
	selector: 'app-text-editor-toolbar',
	standalone: true,
	imports: [
		MatRippleModule,
		MatButtonModule,
		MatIconModule,
		MatSelectModule,
		JsonPipe,
		CallPipe,
		ColorPaletteComponent,
		TextEditorColorActionComponent,
		MatTooltipModule
	],
	templateUrl: './text-editor-toolbar.component.html',
	styleUrl: './text-editor-toolbar.component.scss'
})
export class TextEditorToolbarComponent implements OnInit {
	activeFormatsService = inject(ActiveFormatsService);
	@Input() formats: FormatOption[] = [];
	@Output() formatClick = new EventEmitter<FormatName>();

	actives = computed(() => this.activeFormatsService.activeFormats());

	isFormatActive(actives: FormatName[], name: FormatName) {
		return actives.includes(name);
	}

	formatGroupActive(actives: FormatName[], format: FormatOption<2> | FormatOption<1>): GroupedFormatName {
		const [group] = format.options[0].name.split(":");

		const active =  actives.find(active => active.startsWith(group)) || `${group}:normal`

		return active as GroupedFormatName;
	}

	ngOnInit() {
		this.activeFormatsService.watchActiveFormats();
	}
}
