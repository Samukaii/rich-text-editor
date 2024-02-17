import { CustomFormat } from "../models/custom-format";

export const headingFormats: CustomFormat<"heading">[] = [
	{
		name: "heading",
		formatStrategy: 'surround-selection',
		nodeName: 'h1',
		modifier: (element, options) => {
			const {formatOptions} = options;

			element.className = `heading heading--${formatOptions.level}`;
		}
	},
];
