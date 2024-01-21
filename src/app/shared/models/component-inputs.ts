import { InputSignal } from "@angular/core";
import { Generic } from "../components/text-editor/models/generic";

type NotUndefinedProperties<T> = {
	[K in keyof T]: undefined extends T[K] ? never : K;
}[keyof T];

type UndefinedProperties<T> = {
	[K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

type UndefinedToOptional<T extends Generic> = {
	[K in NotUndefinedProperties<T>]: T[K];
} & {
	[K in UndefinedProperties<T>]?: T[K]
}

type ComponentInputNames<Component extends Generic> = {
	[k in keyof Component]: Component[k] extends InputSignal<any> ? k : never
}[keyof Component];

export type ComponentInputs<Component extends Generic> = UndefinedToOptional<{
	[k in ComponentInputNames<Component>]: Component[k] extends InputSignal<infer Type> ? Type : never
}>;
