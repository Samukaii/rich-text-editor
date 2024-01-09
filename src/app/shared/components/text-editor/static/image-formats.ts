import { EditorFormat } from "../models/editor.format";

const image: EditorFormat<"image"> = {
	name: "image",
	insertionStrategy: 'insert-in-new-line',
	nodeName: "div",
	modifier: (element, options) => {
		const {editor, formatOptions} = options;

		const alignment = editor.createFormat("align", {
			alignment: "left"
		});

		const image = document.createElement("img");

		image.src = formatOptions.src;
		image.style.width = "400px";

		alignment.appendChild(image);
		element.appendChild(alignment);
	}
};

export const imageFormats = [];
