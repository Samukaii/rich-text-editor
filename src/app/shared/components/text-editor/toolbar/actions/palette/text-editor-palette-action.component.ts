import { Component, inject, input } from '@angular/core';
import {
	ComponentOverlayConfig,
	TextEditorOverlayActionDirective
} from "../../../app-text-editor-overlay-action/text-editor-overlay-action.directive";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CallPipe } from "../../../../../pipes/call.pipe";
import { ColorPaletteComponent } from "../../../../color-palette/color-palette.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ToolbarButtonActionsService } from "../../toolbar-button-actions.service";

@Component({
	selector: 'app-text-editor-palette-action',
	standalone: true,
	imports: [
		TextEditorOverlayActionDirective,
		MatButtonModule,
		MatIconModule,
		CallPipe,
		MatTooltipModule
	],
	templateUrl: './text-editor-palette-action.component.html',
	styleUrl: './text-editor-palette-action.component.scss'
})
export class TextEditorPaletteActionComponent {
	icon = input<string>();
	tooltip = input("");

	colors = input([
		{
			tooltip: "Vermelho",
			color: "red"
		},
		{
			tooltip: "Azul",
			color: "blue"
		},
		{
			tooltip: "Verde",
			color: "green"
		},
	])

	editor = inject<ToolbarButtonActionsService<"color" | "background-color">>(ToolbarButtonActionsService);

	componentConfig: ComponentOverlayConfig<typeof ColorPaletteComponent> = {
		component: ColorPaletteComponent,
		inputs: {
			editor: this.editor,
			colors: this.colors(),
			format: this.editor.name,
		}
	}
}
