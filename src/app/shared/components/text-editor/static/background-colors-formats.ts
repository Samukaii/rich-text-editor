import { CustomFormat } from "../models/custom-format";

export const backgroundColorsFormats: CustomFormat<"background-color">[] = [
	{
		name: "background-color",
		formatStrategy: 'surround-selection',
		nodeName: 'span',
		modifier: (element, options) => {
			const {formatOptions} = options;

			element.style.backgroundColor = formatOptions["color"];

			return element;
		}
	},
];
