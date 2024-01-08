import { Component, computed, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatRippleModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormatOption } from "../models/format-option";
import { MatSelectModule } from "@angular/material/select";
import { ActiveFormat, ActiveFormatsService } from "../services/active-formats.service";
import { JsonPipe } from "@angular/common";
import { CallPipe } from "../../../pipes/call.pipe";
import { ColorPaletteComponent } from "../../color-palette/color-palette.component";
import { GroupedFormatName } from "../models/grouped-format-name";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormatName } from "../models/format.name";
import {
	AppTextEditorOverlayActionDirective
} from "../app-text-editor-overlay-action/app-text-editor-overlay-action.directive";
import {
	AppTextEditorSelectActionComponent
} from "./app-text-editor-select-action/app-text-editor-select-action.component";

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
		MatTooltipModule,
		AppTextEditorOverlayActionDirective,
		AppTextEditorSelectActionComponent
	],
	templateUrl: './text-editor-toolbar.component.html',
	styleUrl: './text-editor-toolbar.component.scss'
})
export class TextEditorToolbarComponent implements OnInit {
	activeFormatsService = inject(ActiveFormatsService);
	@Input() formats: FormatOption[] = [];
	@Output() formatClick = new EventEmitter<GroupedFormatName>();

	actives = computed(() => this.activeFormatsService.activeFormats());

	isFormatActive(actives: ActiveFormat[], name: FormatName) {
		return actives.find(format => format.name === name);
	}

	ngOnInit() {
		this.activeFormatsService.watchActiveFormats();
	}
}
