import { commonFormats } from "./common-formats";
import { alignmentFormats } from "./alignment-formats";
import { headingFormats } from "./heading-formats";
import { colorFormats } from "./color-formats";
import { backgroundColorsFormats } from "./background-colors-formats";
import { EditorFormat } from "../models/editor.format";

declare global {
	export interface AllEditorFormats {
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
				level: 1 | 2 | 3
			}
		}
		image: {
			options: {
				src: string;
			}
		},
		align: {
			options: {
				alignment: "left" | "right" | "center" | "justify"
			}
		}
	}
}

const bullets: EditorFormat<"list:bullets"> = {
	name: "list:bullets",
	nodeName: "ul",
	insertionStrategy: 'insert-in-new-line',
	modifier: (element) => {
		const li = document.createElement('li');

		li.appendChild(document.createTextNode('asdasdasd'));

		element.appendChild(li);
	}
};

const ordered: EditorFormat<"list:ordered"> = {
	name: "list:ordered",
	nodeName: "ol",
	insertionStrategy: 'insert-in-new-line',
	modifier: (element) => {
		const li = document.createElement('li');

		li.appendChild(document.createTextNode('asdasdas'));

		element.appendChild(li);
	}
}


export const listFormats = [bullets, ordered];
