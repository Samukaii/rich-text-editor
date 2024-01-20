import {
	TextEditorButtonActionComponent
} from "../../../shared/components/text-editor/toolbar/actions/button/text-editor-button-action.component";
import {
	TextEditorOverlayActionComponent
} from "../../../shared/components/text-editor/toolbar/actions/overlay/text-editor-overlay-action.component";
import { defineToolbarOptions, EditorToolbarButtonsConfig } from "../models/define-custom-toolbar-buttons";

export const EDITOR_DEFAULT_TOOLBAR_BUTTONS = {
	bold: {
		component: TextEditorButtonActionComponent
	},
	italic: {
		component: TextEditorButtonActionComponent
	},
	color: {
		component: TextEditorOverlayActionComponent,
		options: defineToolbarOptions<{
			colors: string[]
		}>()
	},
	"background-color": {
		component: TextEditorOverlayActionComponent,
		options: defineToolbarOptions<{
			colors: string[]
		}>()
	},
	heading: {
		component: TextEditorOverlayActionComponent,
		options: defineToolbarOptions<{
			levels: (1 | 2 | 3)[]
		}>()
	}
} as const satisfies EditorToolbarButtonsConfig;
