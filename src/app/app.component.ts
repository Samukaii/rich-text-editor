import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatRippleModule } from "@angular/material/core";
import { TextEditorComponent } from "./shared/components/text-editor/text-editor.component";
import { FormatOption } from "./shared/components/text-editor/models/format-option";


@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, RouterOutlet, MatButtonModule, MatIconModule, MatRippleModule, TextEditorComponent],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	formats: FormatOption[] = [
		{
			type: "button",
			tooltip: "Negrito",
			icon: "format_bold",
			name: "bold",
		},
		{
			type: "button",
			tooltip: "Itálico",
			icon: "format_italic",
			name: "italic",
		},
		{
			type: "button",
			tooltip: "Tachado",
			icon: "format_strikethrough",
			name: "strikethrough",
		},
		{
			type: "button",
			tooltip: "Sublinhado",
			icon: "format_underlined",
			name: "underlined",
		},
		{
			type: "palette",
			icon: "format_color_text",
			tooltip: "Cor do texto",
			options: [
				{
					tooltip: "Vermelho",
					name: "color:red"
				},
				{
					tooltip: "Laranja",
					name: "color:orange"
				},
				{
					tooltip: "Verde",
					name: "color:green"
				},
				{
					tooltip: "Ciano",
					name: "color:cyan"
				},
				{
					tooltip: "Azul",
					name: "color:blue"
				},
				{
					tooltip: "Índigo",
					name: "color:indigo"
				},
				{
					tooltip: "Violeta",
					name: "color:blueviolet"
				},
				{
					tooltip: "Púrpura",
					name: "color:purple"
				},
				{
					tooltip: "Sem cor",
					name: "color:normal"
				},
			]
		},
		{
			type: "palette",
			icon: "format_color_fill",
			tooltip: "Cor de fundo",
			options: [
				{
					tooltip: "Vermelho",
					name: "background-color:red"
				},
				{
					tooltip: "Laranja",
					name: "background-color:orange"
				},
				{
					tooltip: "Verde",
					name: "background-color:green"
				},
				{
					tooltip: "Ciano",
					name: "background-color:cyan"
				},
				{
					tooltip: "Azul",
					name: "background-color:blue"
				},
				{
					tooltip: "Índigo",
					name: "background-color:indigo"
				},
				{
					tooltip: "Violeta",
					name: "background-color:blueviolet"
				},
				{
					tooltip: "Púrpura",
					name: "background-color:purple"
				},
				{
					tooltip: "Sem cor",
					name: "background-color:normal"
				},
			]
		},
		{
			type: "button",
			tooltip: "Alinhar à esquerda",
			icon: "format_align_left",
			name: "align:left",
		},
		{
			type: "button",
			tooltip: "Alinhar ao centro",
			icon: "format_align_center",
			name: "align:center",
		},
		{
			type: "button",
			tooltip: "Alinhar à direita",
			icon: "format_align_right",
			name: "align:right",
		},
		{
			type: "button",
			tooltip: "Justificar",
			icon: "format_align_justify",
			name: "align:justify",
		},
		{
			type: "select",
			label: "Título",
			options: [
				{
					name: "heading:normal",
					label: "Texto normal"
				},
				{
					name: "heading:1",
					label: "Título 1"
				},
				{
					name: "heading:2",
					label: "Título 2"
				},
				{
					name: "heading:3",
					label: "Título 3"
				},
			]
		}
	];
}
