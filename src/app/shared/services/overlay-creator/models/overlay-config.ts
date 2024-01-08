import { Type } from "@angular/core";
import { Generic } from "../../../components/text-editor/models/generic";

export interface OverlayConfig<T> {
	anchor: HTMLElement;
	component: Type<T>;
	data?: Generic;
	marginY?: number;
	marginX?: number;
}
