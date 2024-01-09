import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatRippleModule } from "@angular/material/core";
import { TextEditorComponent } from "./shared/components/text-editor/text-editor.component";
import { createPaletteOverlay, FormatOption } from "./shared/components/text-editor/models/format-option";


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
			type: "overlay",
			icon: "format_color_text",
			tooltip: "Cor do texto",
			name: "color",
			overlay: createPaletteOverlay("color"),
		},
		{
			type: "overlay",
			icon: "format_color_fill",
			tooltip: "Cor de fundo",
			name: "background-color",
			overlay: createPaletteOverlay("background-color"),
		},
		{
			type: "button",
			tooltip: "Alinhar à esquerda",
			icon: "format_align_left",
			name: "align",
			options: {alignment: "left"}
		},
		{
			type: "button",
			tooltip: "Alinhar ao centro",
			icon: "format_align_center",
			name: "align",
			options: {alignment: "center"}
		},
		{
			type: "button",
			tooltip: "Alinhar à direita",
			icon: "format_align_right",
			name: "align",
			options: {alignment: "right"}
		},
		{
			type: "button",
			tooltip: "Justificar",
			icon: "format_align_justify",
			name: "align",
			options: {alignment: "justify"}
		},
		{
			type: "select",
			name: "heading",
			label: "Título",
			items: [
				{
					options: {level: 1},
					label: "Título 1"
				},
				{
					options: {level: 2},
					label: "Título 2"
				},
				{
					options: {level: 3},
					label: "Título 3"
				},
			]
		},
		{
			type: "button",
			tooltip: "Lista com marcadores",
			name: "list:bullets",
			icon: "format_list_bulleted"
		},
		{
			type: "button",
			tooltip: "Lista ordenada",
			name: "list:ordered",
			icon: "format_list_numbered"
		},
		{
			type: "button",
			tooltip: "Adicionar imagem",
			name: "image",
			icon: "image"
		},
	];
}
