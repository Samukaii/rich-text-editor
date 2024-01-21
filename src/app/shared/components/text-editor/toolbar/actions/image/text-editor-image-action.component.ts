import { Component, input } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { requestUserFile } from "../../../../../functions/request-user-file";
import { createFileUrl } from "../../../../../functions/create-file-url";
import { injectToolbarButtonOptions } from "../../../di/functions/inject-toolbar-button-options";

@Component({
  selector: 'app-text-editor-image-action',
  standalone: true,
	imports: [
		MatButtonModule,
		MatIconModule,
		MatTooltipModule
	],
  templateUrl: './text-editor-image-action.component.html',
  styleUrl: './text-editor-image-action.component.scss'
})
export class TextEditorImageActionComponent {
	editor = injectToolbarButtonOptions<"image">();
	icon = input<string>();
	tooltip = input("");

	async insertImage() {
		const files = await requestUserFile();
		const src = createFileUrl(files[0]);

		this.editor.applyFormat({src});
	}
}
