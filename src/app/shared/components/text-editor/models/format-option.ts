import { FormatName } from "./format.name";
import { Type } from "@angular/core";
import { Generic } from "./generic";
import { ColorPaletteComponent } from "../../color-palette/color-palette.component";
import { EditorFormatName } from "./editor-format-name";


const defaultPaletteColors = [
	{
		tooltip: "Vermelho",
		color: "red"
	},
	{
		tooltip: "Laranja",
		color: "orange"
	},
	{
		tooltip: "Verde",
		color: "green"
	},
	{
		tooltip: "Ciano",
		color: "cyan"
	},
	{
		tooltip: "Azul",
		color: "blue"
	},
	{
		tooltip: "Índigo",
		color: "indigo"
	},
	{
		tooltip: "Violeta",
		color: "blueviolet"
	},
	{
		tooltip: "Púrpura",
		color: "purple"
	},
];
export const createPaletteOverlay = (format: string, colors: {color: string; tooltip: string}[] = defaultPaletteColors) => {
	return {
		component: ColorPaletteComponent,
		options: {
			format,
			colors
		}
	}
};


export type AllFormatOptions = {
	button: {
		type: "button",
		tooltip: string;
		name: EditorFormatName,
		options?: Generic;
		icon: string
	},
	overlay: {
		type: 'overlay',
		tooltip: string;
		icon: string,
		name: EditorFormatName,
		overlay: {
			component: Type<any>;
			options?: Generic;
		}
	},
	select: {
		type: "select",
		label: string;
		name: EditorFormatName,
		items: {
			label: string;
			removeFormat?: true;
			options?: Generic;
		}[]
	}
};

export type FormatOption<Type extends keyof AllFormatOptions = keyof AllFormatOptions> = AllFormatOptions[Type];
