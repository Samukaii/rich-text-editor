import { Type } from "@angular/core";
import { Generic } from "./generic";
import { ColorPaletteComponent } from "../../color-palette/color-palette.component";
import { EditorFormatName } from "./editor-format-name";
import { EditorFormatOptions } from "./editor-format-options";


export const defaultPaletteColors = [
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
export const createPaletteOverlay = (format: string, colors: {
	color: string;
	tooltip: string
}[] = defaultPaletteColors) => {
	return {
		component: ColorPaletteComponent,
		options: {
			format,
			colors
		}
	}
};

type FormatWithOptions = {
	[K in keyof AllEditorFormats]: AllEditorFormats[K] extends { options: any } ? K : never
}[keyof AllEditorFormats];

type FormatItem<T extends keyof AllEditorFormats> = T extends FormatWithOptions ? {
	name: T;
	options: EditorFormatOptions<T>;
} : {name: T}


type DistributiveFormatItem<T = EditorFormatName> = T extends EditorFormatName ? FormatItem<T> : never;

export type SelectFormatItem<T extends EditorFormatName> = {
	name: T,
	items: {
		label: string;
		removeFormat?: true;
		options: EditorFormatOptions<T>;
	}[]
}

type DistributiveSelectItem<T = EditorFormatName> = T extends EditorFormatName ? SelectFormatItem<T> : never;



declare global {
	interface AllFormatTestOptions {
		button: DistributiveFormatItem;
		overlay: {
			component: Type<any>;
			options: Generic;
		},
		select: DistributiveSelectItem
	}
}

export type Abc<K = keyof AllFormatTestOptions> = K extends keyof AllFormatTestOptions ? {
	type: K;
	options: AllFormatTestOptions[K];
} : never;

const a: Abc[] = [
	{
		type: "button",
		options: {
			name: "align",
			options: {
				alignment: "left"
			}
		}
	},
	{
		type: "select",
		options: {
			name: "heading",
			items: [
				{
					label: "Teste",
					removeFormat: true,
					options: {
						level: 1
					}
				}
			]
		}
	},
	{
		type: "overlay",
		options: {
			component: ColorPaletteComponent,
			options: {

			}
		}
	}
]


export type AllFormatOptions = {
	button: {
		type: "button",
		tooltip: string;
		options?: Generic;
		icon: string
	} & DistributiveFormatItem<keyof AllEditorFormats>,
	overlay: {
		type: 'overlay',
		overlay: {
			component: Type<any>;
			options?: Generic;
		}
	},
	select: {
		type: "select",
		label: string;
	} & DistributiveSelectItem<FormatWithOptions>
};

export type FormatOption<Type extends keyof AllFormatOptions = keyof AllFormatOptions> = AllFormatOptions[Type];
