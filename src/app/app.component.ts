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
import { CustomFormat } from "./shared/components/text-editor/models/custom-format";
import {
	AutocompleteStrategyService
} from "./shared/components/text-editor/services/default-format-strategies/autocomplete-strategy.service";


declare global {
	interface DefineCustomEditorFormats {
		autocomplete: {
			options: {
				character: string;
			}
		},
		mention: {
			options: {
				item: {
					id: number,
					name: string
				}
			}
		}
	}
}


export const autocompleteFormat: CustomFormat<"autocomplete"> = {
	name: "autocomplete",
	formatStrategy: AutocompleteStrategyService,
	nodeName: "span",
	modifier: element => {
		element.style.color = "red"
	}
}

export const mentionFormat: CustomFormat<"mention"> = {
	name: "mention",
	formatStrategy: AutocompleteStrategyService,
	nodeName: "span",
	editable: false,
	modifier: (element, options) => {
		const text = document.createTextNode(options.formatOptions.item.name);

		element.appendChild(text);
	}
}

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
			matcher: ({prevText, currentText, insertedCharacter}) => {
				const matchWholeText = Array.from(currentText.matchAll(/@\w*\s?/g));
				const matchWholePrevText = Array.from(prevText.matchAll(/@\w*\s?/g));

				const allPrev = matchWholePrevText.map(match => {
					const matchText = match[0];
					const matchTextWithWhitespace = matchText.match(/@\w*\s/);

					const start = match.index || 0;
					let end: number;

					if(matchTextWithWhitespace)
						end = start + matchTextWithWhitespace[0].length;
					else end = start + 1;

					return { start, end };
				});

				if(insertedCharacter?.value === "@"){
					return [
						...allPrev,
						insertedCharacter
					]
				}

				return matchWholeText.map(match => {
					const matchText = match[0];
					const matchTextWithWhitespace = matchText.match(/@\w*\s/);

					const start = match.index || 0;
					let end: number;

					if(matchTextWithWhitespace)
						end = start + matchTextWithWhitespace[0].length;
					else end = start + 1;

					return { start, end };
				});
			},
			format: {
				name: "autocomplete",
				options: {
					character: "@"
				}
			},
		},
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
