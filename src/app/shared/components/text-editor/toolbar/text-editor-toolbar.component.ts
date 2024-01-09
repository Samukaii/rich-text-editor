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
	TextEditorOverlayActionDirective
} from "../app-text-editor-overlay-action/text-editor-overlay-action.directive";
import { TextEditorSelectActionComponent } from "./actions/select/text-editor-select-action.component";
import { TextEditorButtonActionComponent } from "./actions/button/text-editor-button-action.component";
import { TextEditorOverlayActionComponent } from "./actions/overlay/text-editor-overlay-action.component";
import { EditorFormatName } from "../models/editor-format-name";

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
		TextEditorOverlayActionDirective,
		TextEditorSelectActionComponent,
		TextEditorButtonActionComponent,
		TextEditorOverlayActionComponent
	],
	templateUrl: './text-editor-toolbar.component.html',
	styleUrl: './text-editor-toolbar.component.scss'
})
export class TextEditorToolbarComponent implements OnInit {
	activeFormatsService = inject(ActiveFormatsService);
	@Input() formats: FormatOption[] = [];
	@Output() formatClick = new EventEmitter<EditorFormatName>();

	ngOnInit() {
		this.activeFormatsService.watchActiveFormats();
	}
}
