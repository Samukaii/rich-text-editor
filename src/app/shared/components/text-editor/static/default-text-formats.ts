import { commonFormats } from "./common-formats";
import { alignmentFormats } from "./alignment-formats";
import { headingFormats } from "./heading-formats";
import { colorFormats } from "./color-formats";
import { backgroundColorsFormats } from "./background-colors-formats";
import { CustomFormat } from "../models/custom-format";
import { listFormats } from "./list-formats";
import { imageFormats } from "./image-formats";

export const defaultTextFormats: CustomFormat[] = [
	...commonFormats,
	...alignmentFormats,
	...headingFormats,
	...colorFormats,
	...backgroundColorsFormats,
	...listFormats,
	...imageFormats,
];

declare global {
	export interface DefineCustomEditorFormats {
		bold: {},
		italic: {},
		strikethrough: {},
		underlined: {},
		"list:bullets": {},
		"list:ordered": {},
		color: {
			options: {
				color: string;
			}
		},
		"background-color": {
			options: {
				color: string;
			}
		},
		heading: {
			options: {
				level: 1 | 2 | 3;
			}
		}
		image: {
			options: {
				src: string;
			}
		},
		align: {
			options: {
				alignment: "left" | "right" | "center" | "justify";
			}
		},
		autocomplete: {
			options: {
				character: string;
			}
		}
	}
}

