import { Generic } from "../../../shared/components/text-editor/models/generic";
import { EditorFormatName } from "../../../shared/components/text-editor/models/editor-format-name";
import { Type } from "@angular/core";
import { EDITOR_DEFAULT_TOOLBAR_BUTTONS } from "../static/editor-default-toolbar-buttons";
import { type } from "node:os";
import { K } from "@angular/cdk/keycodes";

export const defineToolbarOptions = <T extends Generic | number>() => ({}) as T;

export type EditorToolbarButtonsConfig = {
	[K in EditorFormatName]?: {
		component: Type<any>;
		optionalOptions?: true;
		options?: Generic
	}
}

export type DefineToolbarButton<T extends EditorToolbarButtonsConfig, K extends keyof T> = T[K] extends { options: Generic }
	? {
		name: K,
		options: T[K]["options"]
	} : K

type CustomKeys<T extends EditorToolbarButtonsConfig> = keyof T | keyof typeof EDITOR_DEFAULT_TOOLBAR_BUTTONS;

export type DefineCustomToolbarButtons<T extends EditorToolbarButtonsConfig> = {
	[K in CustomKeys<T>]: K extends keyof T
		? DefineToolbarButton<T, K>[]
		: K extends keyof typeof EDITOR_DEFAULT_TOOLBAR_BUTTONS
			? DefineToolbarButton<typeof EDITOR_DEFAULT_TOOLBAR_BUTTONS, K>[]
			: never
}[CustomKeys<T>]


export type EditorToolbarButton = {
	name: EditorFormatName;
	options?: Generic
} | EditorFormatName


