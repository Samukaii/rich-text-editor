import {  EditorFormat } from "../models/editor.format";

const bold: EditorFormat<"bold"> = {
	name: "bold",
	autoRemove: true,
	insertionStrategy: 'surround-selection',
	nodeName: 'strong',
}

const italic: EditorFormat<"italic"> = {
	name: "italic",
	autoRemove: true,
	insertionStrategy: 'surround-selection',
	nodeName: 'strong',
}

const strikethrough: EditorFormat<"strikethrough"> = {
	name: "strikethrough",
	autoRemove: true,
	insertionStrategy: 'surround-selection',
	nodeName: 'strong',
}

const underlined: EditorFormat<"underlined"> = {
	name: "underlined",
	autoRemove: true,
	insertionStrategy: 'surround-selection',
	nodeName: 'strong',
}

export const commonFormats = [
	bold, italic, strikethrough, underlined
];
