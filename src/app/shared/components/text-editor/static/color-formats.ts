import { CustomFormat } from "../models/custom-format";

export const colorFormats: CustomFormat<"color">[] = [
	{
		name: "color",
		formatStrategy: 'surround-selection',
		nodeName: 'span',
		modifier: (element, options) => {
			const {formatOptions} = options;

			element.style.color = formatOptions.color;

			return element;
		}
	},
];
