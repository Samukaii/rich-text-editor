import { EditorFormat } from "../models/editor.format";

export const alignmentFormats: EditorFormat<"align">[] = [
	{
		name: "align",
		insertionStrategy: 'surround-selection',
		nodeName: "div",
		modifier: (element, options) => {
			const {formatOptions} = options;

			element.className = `align ${formatOptions["alignment"]}`;

			return element;
		}
	},
];
