import { EditorFormat } from "../models/editor.format";

export const colorFormats = [
	{
		name: "color",
		insertionStrategy: 'surround-selection',
		nodeName: 'span',
		modifier: (element, options) => {
			const {formatOptions} = options;

			element.style.color = formatOptions["color"];

			return element;
		}
	},
] as const satisfies Readonly<EditorFormat[]>;
