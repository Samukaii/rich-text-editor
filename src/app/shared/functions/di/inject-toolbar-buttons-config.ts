import { inject } from "@angular/core";
import { EDITOR_CUSTOM_TOOLBAR_BUTTONS } from "../../components/text-editor/tokens/editor-custom-toolbar-buttons.token";
import { EDITOR_DEFAULT_TOOLBAR_BUTTONS } from "../../../components/text-editor/static/editor-default-toolbar-buttons";

export const injectToolbarButtonsConfig = () => {
	const customButtons = inject(EDITOR_CUSTOM_TOOLBAR_BUTTONS, {optional: true});

	if(!customButtons) return EDITOR_DEFAULT_TOOLBAR_BUTTONS;

	return {
		...EDITOR_DEFAULT_TOOLBAR_BUTTONS,
		...customButtons
	};
};
