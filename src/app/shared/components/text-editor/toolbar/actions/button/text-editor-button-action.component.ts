import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { ToolbarButtonActionsService } from "../../toolbar-button-actions.service";

@Component({
	selector: 'app-text-editor-button-action',
	standalone: true,
	imports: [
		MatButtonModule,
		MatTooltipModule,
		MatIconModule
	],
	templateUrl: './text-editor-button-action.component.html',
	styleUrl: './text-editor-button-action.component.scss'
})
export class TextEditorButtonActionComponent {
	icon = input<string>();
	tooltip = input<string>("");

	editor = inject(ToolbarButtonActionsService);
}
