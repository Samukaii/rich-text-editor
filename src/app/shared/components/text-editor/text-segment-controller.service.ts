import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TextFormatterService } from "./services/text-formatter.service";
import { FormatHelperService } from "./services/format-helper/format-helper.service";
import { EditorMatchRule } from "./models/editor-match-rule";
import { TextSegment } from "./models/text.segment";
import { filterRepeatedItems } from "./helpers/filter-repeated-items";
import { EditorFormat } from "./models/editor-format";
import { isPlatformBrowser } from "@angular/common";

const textSegments = (element: HTMLElement) => {
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

	let currentPosition = 0;

	const getHierarchy = (node: Node, limit: Node | null = null, tree: HTMLElement[] = []): HTMLElement[] => {
		if (!node.parentElement || node.parentElement === limit) return tree;

		return [
			...tree,
			node.parentElement,
			...getHierarchy(node.parentElement, limit, tree)
		]
	}

	const newSegments: TextSegment[] = [];

	while (walker.nextNode()) {
		const current = walker.currentNode as Text;
		const value = current.nodeValue || "";

		newSegments.push({
			hierarchy: getHierarchy(current, element),
			node: current,
			value,
			start: currentPosition,
			end: currentPosition + value.length
		});

		currentPosition += value.length;
	}

	return newSegments;
}

export type TextSegmentElement = {
	element: Node;
	value: string;
	start: number;
	end: number;
};


const getSegmentElements = (segment: TextSegment): TextSegmentElement[] => {
	const hierarchy = segment.hierarchy.map(element => ({
		element,
		value: segment.value,
		end: segment.end,
		start: segment.start
	}));

	const nodeElement: TextSegmentElement = {
		start: segment.start,
		end: segment.end,
		value: segment.value,
		element: segment.node
	};

	return [
		nodeElement,
		...hierarchy
	]
}

const getSegmentByIndex = (segments: TextSegment[], index: number) => {
	return segments.find(segment => index >= segment.start && index <= segment.end);
}


const convertRangeIntoSegment = (element: HTMLElement, range: Range) => {
	const segments = textSegments(element);
	const allSegmentElements = segments.flatMap(segment => getSegmentElements(segment));

	if(!element.contains(range.commonAncestorContainer))
		throw new Error('The range provided is not at element');

	const startSegment = allSegmentElements.find(segment => segment.element === range.startContainer);
	const endSegment = allSegmentElements.find(segment => segment.element === range.endContainer);

	return {
		start: {
			index: startSegment!.start + range.startOffset,
			segment: startSegment
		},
		end: {
			index: endSegment!.start + range.endOffset,
			segment: endSegment
		},
	}
}

const injectTextSegmentsController = () => {
	const isBrowser = injectIsBrowser();
	const selection = isBrowser ? document.getSelection() : {} as Selection;
	const range = selection?.getRangeAt(0);
	let element: HTMLElement | undefined;

	const getElement = () => {
		if(!element)
			throw new Error('The element is not defined');
		return element;
	}

	const setElement = (htmlElement: HTMLElement) => {
		element = htmlElement;
	}

	const getAll = () => {
		return textSegments(getElement());
	};

	const getAt = (index: number) => {
		return getSegmentByIndex(getAll(), index);
	};

	const setCursor = (start: number, end: number) => {
		const startSegment = getAt(start);
		const endSegment = getAt(end);

		if(!startSegment)
			throw new Error(`The startIndex ${start} is not at editor`);

		if(!endSegment)
			throw new Error(`The endIndex ${end} is not at editor`);


		range?.setStart(startSegment.node, start - startSegment.start);
		range?.setStart(endSegment.node, end - endSegment.start);
	}

	const getCursor = () => {
		if(!range) return;

		const { start, end } = convertRangeIntoSegment(getElement(), range);

		return {
			start: start.index,
			end: end.index,
		}
	}


	return {
		getAll,
		setElement,
		getAt,
		getCursor,
		setCursor
	}
}

declare global {
	interface Window {
		viewSegments: () => void;
	}
}

export const injectIsBrowser = () => {
	const platform = inject(PLATFORM_ID);

	return isPlatformBrowser(platform);
}


@Injectable()
export class EditorRegexFormatService {
	private formatter = inject(TextFormatterService);
	private helper = inject(FormatHelperService);
	private editor!: HTMLElement;
	private isBrowser = injectIsBrowser();
	private segmentsController = injectTextSegmentsController()

	private allRegex: EditorMatchRule[] = [];

	setRegexRules(editor: HTMLElement, rules: EditorMatchRule[]) {
		this.segmentsController.setElement(editor);
		this.editor = editor;
		this.allRegex = rules;

		this.editor.removeEventListener('input', this.updateFormats);
		this.editor.addEventListener('input', this.updateFormats);


		if(this.isBrowser)
		window.viewSegments = () => {
			const range = document.getSelection()?.getRangeAt(0);

			if(!range) return;

			return convertRangeIntoSegment(this.editor, range);
		}
	}

	private updateFormats = (event: Event) => {
		event.preventDefault();
		if (!this.editor) return;

		const selection = document.getSelection();

		if (selection) {
			const range = selection?.getRangeAt(0);
			const newRange = range?.cloneRange();

			selection?.removeAllRanges();
			selection?.addRange(newRange);
		}


		this.allRegex.forEach(rule => this.applyRegexRule(rule));
	};

	private applyRegexRule(rule: EditorMatchRule) {
		this.removeNonMatchingFormat(rule);

		const matches = this.matchRule(rule);

		if (!matches.length) return;

		matches.forEach((match) => {
			if (this.rangeIsFormatted(match.start, match.end, rule.format)) return;

			const formattedElement = this.applyFormat(rule.format, match.start, match.end);

			rule.onMatch?.(formattedElement);
		});
	}

	private matchRule(rule: EditorMatchRule) {
		const content = this.editor.textContent || '';

		if (typeof rule.matcher === "string") {
			let expression = new RegExp(rule.matcher, 'g');
			let contentToMatch = content;

			if (rule.caseSensitive === false) {
				expression = new RegExp(rule.matcher.toLowerCase(), 'g');
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
			return rule.matcher(content).map(value => ({
				...value,
				value: ""
			}));

		const result = content.matchAll(rule.matcher);

		return Array.from(result).map(match => {
			const start = match.index || 0;
			const end = start + match[0].length;

			return {start, end, value: match[0]};
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
			const lastChild = parent.lastChild;

			if (!this.canMatch(item.value, rule)) {
				this.saveCursor();
				parent.replaceWith(...Array.from(parent.childNodes));

				this.positionCursor();
			}
		});

		this.formatter.normalizeElement(this.editor);
	}

	private canMatch(text: string, rule: EditorMatchRule) {
		const allMatches = this.matchRule(rule);

		return allMatches.some(match => match.value === text);
	}

	private getSegmentsWithFormat(format: EditorFormat) {
		return this.textSegments()
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

	private textSegments() {
		const walker = document.createTreeWalker(this.editor, NodeFilter.SHOW_TEXT);

		let currentPosition = 0;

		const getHierarchy = (node: Node, limit: Node | null = null, tree: HTMLElement[] = []): HTMLElement[] => {
			if (!node.parentElement || node.parentElement === limit) return tree;

			return [
				...tree,
				node.parentElement,
				...getHierarchy(node.parentElement, limit, tree)
			]
		}

		const newSegments: TextSegment[] = [];

		while (walker.nextNode()) {
			const current = walker.currentNode as Text;
			const value = current.nodeValue || "";

			newSegments.push({
				hierarchy: getHierarchy(current, this.editor),
				node: current,
				value,
				start: currentPosition,
				end: currentPosition + value.length
			});

			currentPosition += value.length;
		}

		return newSegments;
	}

	cropElement(start: number, end: number) {
		let first = this.textSegments().find(item => start > item.start && start < item.end);

		if (first) this.splitSegment(first, start - first.start);

		let last = this.textSegments().find(item => end > item.start && end < item.end);

		if (last) this.splitSegment(last, end - last.start);
	}

	insertAt(elementToInsert: HTMLElement, index: number) {
		this.saveCursor();
		const segmentBeforeIndex = this.textSegments().find(segment => segment.end === index);
		if (!segmentBeforeIndex) return;

		const hierarchy = segmentBeforeIndex.hierarchy;
		const topLevelElement = (hierarchy.at(-1) || segmentBeforeIndex.node) as Node;

		if (topLevelElement.nextSibling) {
			this.editor?.insertBefore(elementToInsert, topLevelElement.nextSibling);
		} else {
			this.editor?.appendChild(elementToInsert);
		}

		this.positionCursorAfterTheElement(elementToInsert)
	}

	private positionCursorAfterTheElement(element: Node) {
		const range = document.getSelection()?.getRangeAt(0);
		console.trace(element.nodeValue);
		range?.setStartAfter(element);
		range?.setEndAfter(element);
	}

	private cursor?: Range;

	private saveCursor() {
		const range = document.getSelection()?.getRangeAt(0);

		this.cursor = range?.cloneRange();
	}

	positionCursor(startOffset = 0, endOffset = 0) {
		const range = document.getSelection()?.getRangeAt(0);

		if (!this.cursor) return;

		range?.setStart(this.cursor.startContainer, this.cursor.startOffset + endOffset);
		range?.setEnd(this.cursor.endContainer, this.cursor.endOffset + startOffset);
	}

	private applyFormat(format: EditorFormat, start: number, end: number) {
		this.cropElement(start, end);

		const formatElement = this.helper.createRegexElement(format.name, format.options);

		const nodes = this.textSegments().filter(info => info.start >= start && info.end <= end);

		const topLevelNodes = nodes.map(node => node.hierarchy.at(-1) || node.node);

		const withoutRepeated = filterRepeatedItems(topLevelNodes);

		formatElement.append(...withoutRepeated);

		this.formatter.removeFormatFromElement(formatElement, format.name);

		this.insertAt(formatElement, start);

		return formatElement;
	}

	private splitSegment(info: TextSegment, index: number) {
		let firstPart: Node = info.node;
		let secondPart: Node = info.node.splitText(index);

		let parent: Node | null = info.hierarchy[0];

		if (!(parent instanceof HTMLElement)) return;
		if (parent === this.editor) return;

		while (parent instanceof HTMLElement) {
			if (parent === this.editor) break;

			let [leftSide, rightSide] = this.splitElement(parent, firstPart, secondPart);

			firstPart = leftSide;
			secondPart = rightSide;

			parent = leftSide.parentElement;
		}
	}

	splitElement(element: HTMLElement, leftChild: Node, rightChild: Node) {
		const leftSide = element.cloneNode();
		const rightSide = element.cloneNode();

		const leftChildren = [
			...this.getPreviousSiblings(leftChild),
			leftChild,
		];

		const rightChildren = [
			rightChild,
			...this.getNextSiblings(rightChild)
		];

		leftChildren.forEach(child => rightSide.appendChild(child));
		rightChildren.forEach(child => leftSide.appendChild(child));

		element.replaceWith(leftSide, rightSide);

		return [leftSide, rightSide];
	}

	private getPreviousSiblings(node: Node) {
		const list: Node[] = [];

		let current = node;

		while (current.previousSibling) {
			list.push(current.previousSibling);

			current = current.previousSibling;
		}

		return list;
	}

	private getNextSiblings(node: Node) {
		const list: Node[] = [];

		let current = node;

		while (current.nextSibling) {
			list.push(current.nextSibling);

			current = current.nextSibling;
		}

		return list;
	}
}
