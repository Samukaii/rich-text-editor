import { GroupedFormatName } from "./grouped-format-name";
import { FormatName } from "./format.name";
import { Type } from "@angular/core";
import { Generic } from "./generic";
import { ColorPaletteComponent } from "../../color-palette/color-palette.component";


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

export type AllFormatOptions = [
	{
		type: "button",
		tooltip: string;
		name: FormatName,
		options?: Generic;
		icon: string
	},
	{
		type: 'overlay',
		tooltip: string;
		icon: string,
		name: FormatName,
		overlay: {
			component: Type<any>;
			options?: Generic;
		}
	},
	{
		type: "select",
		label: string;
		name: FormatName,
		items: {
			label: string;
			removeFormat?: true;
			options?: Generic;
		}[]
	},
];

export type FormatOption<Index extends number = number> = AllFormatOptions[Index];
