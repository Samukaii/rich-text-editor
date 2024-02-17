import { EditorFormatName } from "./editor-format-name";
import { EditorFormatOptions } from "./editor-format-options";
import { InjectableType } from "@angular/core";
import { defaultEditorInsertionStrategy } from "../static/default-editor-insertion-strategy";
import { EditorFormatStrategy } from "./editor-format-strategy";

export interface EditorModifierOptions<Name extends EditorFormatName> {
	formatOptions: EditorFormatOptions<Name>;
	editor: {
		createFormat: <Name extends EditorFormatName>(
			name: Name,
			options: EditorFormatOptions<Name>
		) => HTMLElement;
	}
}


export type EditorFormatConfig<Name extends EditorFormatName = EditorFormatName> = {
	name: Name;
	autoRemove?: boolean;
	formatStrategy: (keyof typeof defaultEditorInsertionStrategy) | InjectableType<EditorFormatStrategy>,
	editable?: boolean;
	nodeName: keyof HTMLElementTagNameMap;
	modifier?: (element: HTMLElement, options: EditorModifierOptions<Name>) => void;
};
