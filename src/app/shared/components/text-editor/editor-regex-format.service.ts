import { inject, Injectable } from '@angular/core';
import { TextFormatterService } from "./services/text-formatter.service";
import { FormatHelperService } from "./services/format-helper/format-helper.service";
import { EditorMatchRule } from "./models/editor-match-rule";
import { TextSegment } from "./models/text.segment";
import { filterRepeatedItems } from "./helpers/filter-repeated-items";
import { EditorFormat } from "./models/editor-format";
import { TextSegmentControllerService } from "./text-segment-controller.service";

export const onNodeRemove = (node: Node, callback: () => void) => {
	const parent = node.parentElement;

	const observer = new MutationObserver(() => {
		if(!parent?.contains(node)) {
			callback();
			observer.disconnect();
		}
	});

	if(!parent)
		throw new Error('The element has no parent');

	observer.observe(parent, {characterData: true, subtree: true, childList: true })
}


@Injectable()
export class EditorRegexFormatService {
	private formatter = inject(TextFormatterService);
	private helper = inject(FormatHelperService);
	private editor!: HTMLElement;
	private segmentsController = inject(TextSegmentControllerService);

	private allRegex: EditorMatchRule[] = [];
	prevTextContent = "";

	setRegexRules(editor: HTMLElement, rules: EditorMatchRule[]) {
		this.editor = editor;
		this.allRegex = rules;

		this.prevTextContent = this.editor.textContent || "";

		this.editor.removeEventListener('input', this.updateFormats);
		this.editor.removeEventListener('beforeinput', this.savePrevContent);
		this.editor.addEventListener('input', this.updateFormats);
		this.editor.addEventListener('beforeinput', this.savePrevContent);
	}

	getDifference(prevText: string, currentText: string): { value: string, start: number, end: number } | undefined {
		for (let i = 0; i < Math.min(prevText.length, currentText.length); i++) {
			if (prevText[i] !== currentText[i]) {

				const value = currentText.substring(i, i + 1);

				return { value, start: i, end: i + 1 };
			}
		}

		return;
	}

	private updateFormats = () => {
		const content = this.editor.textContent || "";

		if (!this.editor || !this.getDifference(this.prevTextContent, content)) return;

		this.allRegex.forEach(rule => this.applyRegexRule(rule));
	};

	savePrevContent = () => {
		this.prevTextContent = this.editor.textContent || "";
	}

	private applyRegexRule(rule: EditorMatchRule) {
		this.removeNonMatchingFormat(rule);

		const matches = this.matchRule(rule);

		if (!matches.length) return;

		matches.forEach((match) => {
			if (this.rangeIsFormatted(match.start, match.end, rule.format)) return;

			const formattedElement = this.applyFormat(rule.format, match.start, match.end);

			rule.onMatch?.(formattedElement!);
		});
	}

	private matchRule(rule: EditorMatchRule) {
		const content = this.editor.textContent || '';

		if (typeof rule.matcher === "string") {
			let expression = new RegExp(rule.matcher, 'gm');
			let contentToMatch = content;

			if (rule.caseSensitive === false) {
				expression = new RegExp(rule.matcher.toLowerCase(), 'gm');
				contentToMatch = content.toLowerCase();
			}

			const result = contentToMatch.matchAll(expression);

			return Array.from(result).map(match => {
				const start = match.index || 0;
				const end = start + match[0].length;

				return {start, end, value: match[0]};
			})
		}

		if (typeof rule.matcher === "function")
			return rule.matcher({
				prevText: this.prevTextContent,
				currentText: content,
				insertedCharacter: this.getDifference(this.prevTextContent, content)!
			}).map(value => ({
				...value,
				value: ""
			}));

		const result = content.matchAll(rule.matcher);

		return Array.from(result).map(match => {
			const start = match.index || 0;
			const end = start + match.at(-1)!.length;

			return {start, end, value: match.at(-1)!};
		})
	}

	private removeNonMatchingFormat(rule: EditorMatchRule) {
		const info = this.getSegmentsWithFormat(rule.format);
		const oldCursor = this.segmentsController.getCursor();

		const getFormat = (info: TextSegment) => {
			return info.hierarchy.filter(parent =>
				this.helper.nodeIsFormat(parent, rule.format.name) && this.helper.nodeIsRegexFormat(parent))[0]
		};

		info.forEach(item => {
			const parent = getFormat(item);

			if (!this.canMatch(item.value, rule)) {
				parent.replaceWith(...Array.from(parent.childNodes));
			}
		});

		if(oldCursor) this.segmentsController.setCursor(oldCursor);

		this.formatter.normalizeElement(this.editor);
	}

	private canMatch(text: string, rule: EditorMatchRule) {
		const allMatches = this.matchRule(rule);

		return allMatches.some(match => match.value === text);
	}

	private getSegmentsWithFormat(format: EditorFormat) {
		return this.segmentsController.getAll()
			.filter(({hierarchy}) => hierarchy
				.some(parent => {
						const hasFormat = this.helper.nodeIsFormat(parent, format.name);
						const isRegex = this.helper.nodeIsRegexFormat(parent);

						return hasFormat && isRegex;
					}
				)
			)
	}


	private rangeIsFormatted(start: number, end: number, format: EditorFormat) {
		const formatted = this.getSegmentsWithFormat(format);

		return formatted.some(info => info.start <= start && info.end >= end);
	}

	private applyFormat(format: EditorFormat, start: number, end: number) {
		const options = 'options' in format ? format.options : undefined;

		return this.formatter.applyRegexFormat({start, end}, format.name, options);
	}
}
