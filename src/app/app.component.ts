import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatRippleModule } from "@angular/material/core";
import { TextEditorComponent } from "./shared/components/text-editor/text-editor.component";
import { TextEditorToolbarComponent } from "./shared/components/text-editor/toolbar/text-editor-toolbar.component";
import { DefaultEditorToolbarButtons } from "./shared/components/text-editor/models/define-custom-toolbar-buttons";
import { EditorMatchRule } from "./shared/components/text-editor/models/editor-match-rule";

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, RouterOutlet, MatButtonModule, MatIconModule, MatRippleModule, TextEditorComponent, TextEditorToolbarComponent],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	formats: DefaultEditorToolbarButtons[] = [
		{name: "bold",},
		{name: "italic"},
		{name: "underlined"},
		{name: "strikethrough"},
		{name: "image"},
		{name: "color"},
		{name: "background-color",},
		{name: "heading",},
		{name: "list:bullets",},
		{name: "list:ordered"}
	];

	regexRules: EditorMatchRule[] = [
		{
			matcher: /\*\*.*\*\*/g,
			format: {
				name: "bold",
			},
		},
		{
			matcher: /__.*__/g,
			format: {
				name: "italic",
			},
		},
		{
			matcher: /~.*~/g,
			format: {
				name: "strikethrough",
			},
		},
		{
			matcher: /\^.*\^/g,
			format: {
				name: "underlined",
			},
		},
	];
}
