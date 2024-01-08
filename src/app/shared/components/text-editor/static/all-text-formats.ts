import { commonFormats } from "./common-formats";
import { alignmentFormats } from "./alignment-formats";
import { headingFormats } from "./heading-formats";
import { colorFormats } from "./color-formats";
import { backgroundColorsFormats } from "./background-colors-formats";
import { EditorFormat, FormatBlock } from "../models/editor.format";

export const allTextFormats = [
	...commonFormats,
	...alignmentFormats,
	...headingFormats,
	...colorFormats,
	...backgroundColorsFormats,
	{
		name: "list:bullets",
		nodeName: "ul",
		insertionStrategy: 'insert-in-new-line',
		modifier: (element) => {
			const li = document.createElement('li');

			li.appendChild(document.createTextNode(' '));

			element.appendChild(li);
		}
	},
	{
		name: "list:bullets",
		nodeName: "ol",
		insertionStrategy: 'insert-in-new-line',
		modifier: (element) => {
			const li = document.createElement('li');

			li.appendChild(document.createTextNode(' '));

			element.appendChild(li);
		}
	},
	{
		name: "image",
		insertionStrategy: 'insert-in-new-line',
		nodeName: "div",
		modifier: (element, options) => {
			const {editor, formatOptions} = options;

			const alignment = editor.createFormat("align", {alignment: "left"});
			const image = document.createElement("img");


			image.src = formatOptions["src"];
			image.style.width = "400px";

			alignment.appendChild(image);
			element.appendChild(alignment);
		}
	},
] as const satisfies Readonly<EditorFormat[]>;
