import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import {
	injectToolbarButtonOptions
} from "../../../di/functions/inject-toolbar-button-options";
import { ToolbarButtonActionsService } from "../../toolbar-button-actions.service";


@Component({
  selector: 'app-text-editor-list-action',
  standalone: true,
	imports: [
		MatButtonModule,
		MatIconModule,
		MatTooltipModule
	],
  templateUrl: './text-editor-list-action.component.html',
  styleUrl: './text-editor-list-action.component.scss'
})
export class TextEditorListActionComponent {
	tooltip = input("tooltip");
	icon = input<string>();

	editor = inject(ToolbarButtonActionsService);
}
