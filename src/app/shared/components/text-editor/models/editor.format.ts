import { Generic } from "./generic";
import { EditorFormatName } from "./editor-format-name";
import { EditorFormatOptions } from "./editor-format-options";

export interface EditorModifierOptions<Name extends EditorFormatName> {
	formatOptions: EditorFormatOptions<Name>;
	editor: {
		createFormat: <Name extends EditorFormatName>(
			name: Name,
			options: EditorFormatOptions<Name>
		) => HTMLElement;
	}
}


export type EditorFormat<Name extends EditorFormatName = EditorFormatName> = {
	name: Name;
	autoRemove?: boolean;
	insertionStrategy: 'surround-selection' | 'insert-in-new-line' | 'insert-in-same-line',
	editable?: boolean;
	nodeName: keyof HTMLElementTagNameMap;
	modifier?: (element: HTMLElement, options: EditorModifierOptions<Name>) => void;
};
