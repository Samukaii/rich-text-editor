import { FormatBlock, FormatBlockChild } from "../models/editor.format";

export const allTextBlocks = [
	{
		name: "image",
		nodeName: "div",
		children: [
			{
				format: "align:left",
				children: ["image"]
			}
		] as FormatBlockChild[]
	}
] as const satisfies Readonly<FormatBlock[]>;
