import { EditorFormat } from "../models/editor.format";

export const backgroundColorsFormats: EditorFormat<"background-color">[] = [
	{
		name: "background-color",
		insertionStrategy: 'surround-selection',
		nodeName: 'span',
		modifier: (element, options) => {
			const {formatOptions} = options;

			element.style.backgroundColor = formatOptions["color"];

			return element;
		}
	},
];
