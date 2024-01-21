import { Provider } from "@angular/core";
import {
	EDITOR_CUSTOM_TOOLBAR_BUTTONS
} from "../tokens/editor-custom-toolbar-buttons";
import { EditorToolbarButtonsConfig } from "../../models/define-custom-toolbar-buttons";

export const provideCustomToolbarButtons = (toolbarButtons: EditorToolbarButtonsConfig): Provider[] => {
	return [
		{
			provide: EDITOR_CUSTOM_TOOLBAR_BUTTONS,
			useValue: toolbarButtons
		}
	]
}
