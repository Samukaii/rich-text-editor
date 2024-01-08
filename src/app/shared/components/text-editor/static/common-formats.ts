import { EditorFormat } from "../models/editor.format";

export const commonFormats = [
	{
		name: "bold",
		autoRemove: true,
		insertionStrategy: 'surround-selection',
		nodeName: 'strong',
	},
	{
		name: "italic",
		autoRemove: true,
		insertionStrategy: 'surround-selection',
		nodeName: 'em',
	},
	{
		name: "strikethrough",
		autoRemove: true,
		insertionStrategy: 'surround-selection',
		nodeName: 's',
	},
	{
		name: "underlined",
		autoRemove: true,
		insertionStrategy: 'surround-selection',
		nodeName: 'u',
	},
] as const satisfies Readonly<EditorFormat[]>;
