import { EditorFormat } from "../models/editor.format";

export const headingFormats: EditorFormat<"heading">[] = [
	{
		name: "heading",
		insertionStrategy: 'surround-selection',
		nodeName: 'h1',
		modifier: (element, options) => {
			const {formatOptions} = options;

			element.className = `heading heading--${formatOptions.level}`;
		}
	},
];
