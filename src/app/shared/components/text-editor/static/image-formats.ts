import { CustomFormat } from "../models/custom-format";

const image: CustomFormat<"image"> = {
	name: "image",
	formatStrategy: 'insert-in-new-line',
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

export const imageFormats = [
	image
];
