import { InputSignal } from "@angular/core";
import { Generic } from "../components/text-editor/models/generic";


type ComponentInputNames<Component extends Generic> = {
	[k in keyof Component]: Component[k] extends InputSignal<any> ? k: never
}[keyof Component];

export type ComponentInputs<Component extends Generic> = {
	[k in ComponentInputNames<Component>]: Component[k] extends InputSignal<infer Type> ? Type : never
}
