import { EditorFormat } from "./editor-format";

export interface MatchRule {
	matcher: RegExp | string | ((text: string) => {start: number; end: number} | false);
	format: EditorFormat;
	onMatch?: (formattedElement: HTMLElement) => void;
}
