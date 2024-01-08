import { FormatName } from "./format.name";
import { Generic } from "./generic";
import { ActiveFormat } from "../services/active-formats.service";

export interface EditorModifierOptions {
	formatOptions: Generic;
	editor: {
		createFormat: (name: string, options: Generic) => HTMLElement;
	}
}


export type EditorFormat = {
	name: string;
	autoRemove?: boolean;
	insertionStrategy: 'surround-selection' | 'insert-in-new-line' | 'insert-in-same-line',
	editable?: boolean;
	nodeName: keyof HTMLElementTagNameMap;
	modifier?: (element: HTMLElement, options: EditorModifierOptions) => void;
};

export type FormatBlockChild = FormatName | {
	format: FormatName;
	children?: FormatBlockChild[]
};

export type FormatBlock = {
	name: string;
	nodeName: string;
	children: FormatBlockChild[];
};
