import { EditorFormat } from "./editor-format";

export type MatchRuleResult = {start: number; end: number};
export type MatchRuleFn = (info: {
	prevText: string;
	currentText: string;
	insertedCharacter?: {
		start: number,
		end: number,
		value: string;
	}
}) => MatchRuleResult[];


export interface EditorMatchRule {
	matcher: RegExp | string | MatchRuleFn;
	caseSensitive?: boolean;
	format: EditorFormat;
	whiteSpace?: boolean;
	onMatch?: (formattedElement: HTMLElement) => void;
}
