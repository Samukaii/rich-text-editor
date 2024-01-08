import { Signal } from "@angular/core";

export interface EditingToolbarButton {
	icon: string;
	tooltip: string;
	click: () => void;
	active?: boolean;
	activeIndicators?: ('right' | 'left')[];
}
