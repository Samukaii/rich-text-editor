import { ActiveFormat } from "../services/active-formats.service";

export type TextSegment = {
	hierarchy: HTMLElement[];
	lastParent?: HTMLElement;
	formats: ActiveFormat[];
	positionReference?: number;
	node: Text;
	value: string;
	start: number;
	end: number;
};
