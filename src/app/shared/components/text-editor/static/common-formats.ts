import { CustomFormat } from "../models/custom-format";


const bold: CustomFormat<"bold"> = {
	name: "bold",
	autoRemove: true,
	formatStrategy: 'surround-selection',
	nodeName: 'strong',
}

const italic: CustomFormat<"italic"> = {
	name: "italic",
	autoRemove: true,
	formatStrategy: 'surround-selection',
	nodeName: 'em',
}

const strikethrough: CustomFormat<"strikethrough"> = {
	name: "strikethrough",
	autoRemove: true,
	formatStrategy: 'surround-selection',
	nodeName: 's',
}

const underlined: CustomFormat<"underlined"> = {
	name: "underlined",
	autoRemove: true,
	formatStrategy: 'surround-selection',
	nodeName: 'u',
}

export const commonFormats = [
	bold, italic, strikethrough, underlined
];
