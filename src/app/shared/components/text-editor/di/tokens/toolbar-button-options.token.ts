import { InjectionToken } from "@angular/core";
import { EditorFormatName } from "../../models/editor-format-name";

export interface ToolbarButtonOptions<Format = EditorFormatName> {
	name: Format;
	editorElement: HTMLElement;
}

export const TOOLBAR_BUTTON_OPTIONS_TOKEN = new InjectionToken<ToolbarButtonOptions>('toolbar-button-options-token');
