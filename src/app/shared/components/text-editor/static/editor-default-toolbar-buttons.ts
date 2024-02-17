import { TextEditorButtonActionComponent } from "../toolbar/actions/button/text-editor-button-action.component";
import { TextEditorPaletteActionComponent } from "../toolbar/actions/palette/text-editor-palette-action.component";
import { defineToolbarButtonComponent, EditorToolbarButtonsConfig } from "../models/define-custom-toolbar-buttons";
import { TextEditorSelectActionComponent } from "../toolbar/actions/select/text-editor-select-action.component";
import { TextEditorImageActionComponent } from "../toolbar/actions/image/text-editor-image-action.component";
import { TextEditorListActionComponent } from "../toolbar/actions/list/text-editor-list-action.component";

export const EDITOR_DEFAULT_TOOLBAR_BUTTONS = {
	bold: defineToolbarButtonComponent(TextEditorButtonActionComponent, {
		icon: "format_bold",
		tooltip: "Negrito"
	}),
	italic: defineToolbarButtonComponent(TextEditorButtonActionComponent, {
		tooltip: "Itálico",
		icon: "format_italic"
	}),
	underlined: defineToolbarButtonComponent(TextEditorButtonActionComponent, {
		tooltip: "Sublinhado",
		icon: "format_underlined"
	}),
	strikethrough: defineToolbarButtonComponent(TextEditorButtonActionComponent, {
		tooltip: "Tachado",
		icon: "strikethrough_s"
	}),
	color: defineToolbarButtonComponent(TextEditorPaletteActionComponent, {
		tooltip: "Cor do texto",
		icon: "format_color_text",
	}),
	"list:ordered": defineToolbarButtonComponent(TextEditorListActionComponent, {
		tooltip: "Lista ordenada",
		icon: "format_list_numbered"
	}),
	"list:bullets": defineToolbarButtonComponent(TextEditorListActionComponent, {
		tooltip: "Lista com marcadores",
		icon: "format_list_bulleted"
	}),
	"background-color": defineToolbarButtonComponent(TextEditorPaletteActionComponent, {
		tooltip: "Cor de fundo",
		icon: "format_color_fill",
	}),
	heading: defineToolbarButtonComponent(TextEditorSelectActionComponent, {
		label: "Títulos",
		normalLabel: "Texto normal",
		options: [
			{
				label: "Título 1",
				level: 1
			},
			{
				label: "Título 2",
				level: 2
			},
			{
				label: "Título 3",
				level: 3
			},
		]
	}),
	image: defineToolbarButtonComponent(TextEditorImageActionComponent, {
		icon: "add_photo_alternate",
		tooltip: "Adicionar imagem"
	})
} as const satisfies EditorToolbarButtonsConfig;
