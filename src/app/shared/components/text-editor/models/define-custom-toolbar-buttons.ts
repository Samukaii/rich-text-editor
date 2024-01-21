import { Generic } from "./generic";
import { EditorFormatName } from "./editor-format-name";
import { Type } from "@angular/core";
import { EDITOR_DEFAULT_TOOLBAR_BUTTONS } from "../static/editor-default-toolbar-buttons";
import { ComponentInputs } from "../../../models/component-inputs";


export const defineToolbarButtonComponent = <Component extends Type<any>>
(component: Component, options?: Partial<ComponentInputs<InstanceType<Component>>>) => {
	return {component, options};
};


export type EditorToolbarButtonsConfig = {
	[K in EditorFormatName]?: {
		component: Type<any>;
		options?: Generic
	}
}

export type DefineToolbarButton<T extends EditorToolbarButtonsConfig, K extends keyof T> = T[K] extends {
		options: Generic
	}
	? {
		name: K,
		options: T[K]["options"]
	} : T[K] extends { options?: Generic }
		? {
			name: K,
			options?: T[K]["options"]
		}
		: { name: K }

type CustomKeys<T extends EditorToolbarButtonsConfig> = keyof T | keyof typeof EDITOR_DEFAULT_TOOLBAR_BUTTONS;

export type DefineCustomToolbarButtons<T extends EditorToolbarButtonsConfig> = {
	[K in CustomKeys<T>]: K extends keyof T
		? DefineToolbarButton<T, K>
		: K extends keyof typeof EDITOR_DEFAULT_TOOLBAR_BUTTONS
			? DefineToolbarButton<typeof EDITOR_DEFAULT_TOOLBAR_BUTTONS, K>
			: never
}[CustomKeys<T>]


export type EditorToolbarButton = {
	name: EditorFormatName;
	options?: Generic
};

export type DefaultEditorToolbarButtons = DefineCustomToolbarButtons<{}>;
