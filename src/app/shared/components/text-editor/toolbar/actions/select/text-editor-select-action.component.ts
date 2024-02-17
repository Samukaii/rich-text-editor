import { Component, computed, inject, input } from '@angular/core';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { CallPipe } from "../../../../../pipes/call.pipe";
import { injectToolbarButtonOptions } from "../../../di/functions/inject-toolbar-button-options";
import { ToolbarButtonActionsService } from "../../toolbar-button-actions.service";

@Component({
	selector: 'app-text-editor-select-action',
	standalone: true,
	imports: [
		MatFormFieldModule,
		MatSelectModule,
		CallPipe
	],
	templateUrl: './text-editor-select-action.component.html',
	styleUrl: './text-editor-select-action.component.scss'
})
export class TextEditorSelectActionComponent {
	label = input("Título");
	normalLabel = input("Texto normal");
	options = input([
		{label: "Título 1", level: 1 as 1},
		{label: "Título 2", level: 2 as 2},
		{label: "Título 3", level: 3 as 3},
	]);

	editor = inject<ToolbarButtonActionsService<"heading">>(ToolbarButtonActionsService);

	activeItem = computed(() => {
		return this.editor.activeOptions()?.level || 0
	})
}
