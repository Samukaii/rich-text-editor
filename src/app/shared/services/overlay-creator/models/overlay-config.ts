import { Type } from "@angular/core";
import { Generic } from "../../../components/text-editor/models/generic";
import { ComponentInputs } from "../../../models/component-inputs";
import { ComponentType } from "@angular/cdk/overlay";

export type OverlayConfig<T extends ComponentType<any>> = {
	anchor: HTMLElement;
	component: T;
	marginY?: number;
	marginX?: number;
} & ({} extends ComponentInputs<InstanceType<T>>
	? {
		inputs?: ComponentInputs<InstanceType<T>>
	} : {
		inputs: ComponentInputs<InstanceType<T>>
	})
