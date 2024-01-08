import { EditorFormat } from "../models/editor.format";

export const alignmentFormats = [
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
] satisfies Readonly<EditorFormat[]>;
