import { CustomFormat } from "../models/custom-format";

export const alignmentFormats: CustomFormat<"align">[] = [
	{
		name: "align",
		formatStrategy: 'surround-selection',
		nodeName: "div",
		modifier: (element, options) => {
			const {formatOptions} = options;

			element.className = `align ${formatOptions["alignment"]}`;

			return element;
		}
	},
];
