import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { TextSegment } from "./models/text.segment";
import { DOCUMENT } from "@angular/common";
import { ActiveFormatsService } from "./services/active-formats.service";
import { EditorFormatName } from "./models/editor-format-name";

export type TextSegmentElement = {
	element: Node;
	value: string;
	start: number;
	end: number;
};

export interface SegmentPosition {
	positionReference?: number;
	start: number;
	end?: number;
}


@Injectable()
export class TextSegmentControllerService {
	private document = inject(DOCUMENT);
	private helper = inject(ActiveFormatsService);
	private destroyRef = inject(DestroyRef);

	private _element?: HTMLElement;

	private get element() {
		if (!this._element)
			throw new Error('The element is not defined')

		return this._element;
	}

	private get range() {
		return this.document.getSelection()?.getRangeAt(0);
	}

	private observer?: MutationObserver;


	segments = signal<TextSegment[]>([]);

	setElement(element: HTMLElement) {
		this._element = element;

		this.observer?.disconnect();

		this.observer = new MutationObserver(() => {
			console.log(this.getAll());
			this.segments.set(this.getAll());
		});

		this.observer.observe(element, {subtree: true, childList: true, characterData: true});

		this.destroyRef.onDestroy(() => {
			this.observer?.disconnect();
		});
	}

	getAt(index: number, inclusive = false) {
		const all = this.getAll();
		const result = all.find(segment => {
			if(inclusive)
				return index >= segment.start && index <= segment.end

			return index >= segment.start && index < segment.end
		});

		if(!result) console.log(index, all);

		return result;
	};

	getText(position: SegmentPosition) {
		const {start, end = start} = position;

		const all = this.getAllBetween(start, end);

		const texts = all.map((segment, index) => {
			const text = segment.value;
			const segmentStart = start - segment.start;
			const segmentEnd = end - segment.start;

			if(index === 0)
				return text.substring(segmentStart, segmentEnd > text.length ? text.length : segmentEnd);

			if(index === all.length - 1)
				return text.substring(segmentStart < 0 ? 0: segmentStart, segmentEnd);

			return text;
		})


		return texts.join('');
	}

	getRange(position: SegmentPosition) {
		const {start, end = start} = position;
		const startSegment = this.getAt(start, true);
		const endSegment = this.getAt(end, true);

		if (!startSegment)
			throw new Error(`The startIndex ${start} is not at editor`);

		if (!endSegment)
			throw new Error(`The endIndex ${end} is not at editor`);

		return {
			range: {start, end},
			commonParent: this.findCommonParent(startSegment, endSegment) || this.element,
			segmentsBetween: this.getAllBetween(start, end)
		}
	}

	surroundWith(position: SegmentPosition, element: HTMLElement) {
		const oldCursor = this.getCursor();
		this.cropAtCommonParent(position);
		const range = this.getRange(position);

		const itemsToAppend = range.segmentsBetween.map(segment => {
			const last = segment.hierarchy.find(element => element.parentElement === range.commonParent);

			return last || segment.node
		})

		element.append(...itemsToAppend);

		this.insertAt(range.commonParent, element, position.start);

		if (oldCursor) this.setCursor(oldCursor);
	}

	getAllAtCursor() {
		const cursor = this.getCursor();

		if (!cursor) return;

		return this.getRange(cursor);
	}

	private crop(reference: HTMLElement, position: SegmentPosition) {
		const {start, end = start} = position;
		let range = this.getRange(position);
		const oldCursor = this.getCursor();

		let first = range.segmentsBetween[0];

		if (first) this.splitSegment(first, start - first.start, reference);

		range = this.getRange(position);

		let last = range.segmentsBetween.at(-1);

		if (last) this.splitSegment(last, end - last.start, reference);

		if (oldCursor)
			this.setCursor(oldCursor);
	}

	cropAtCommonParent(position: SegmentPosition) {
		let range = this.getRange(position);

		this.crop(range.commonParent, position);
	}

	cropAtRoot(position: SegmentPosition) {
		this.crop(this.element, position);
	}

	insertText(text: string, index: number) {
		const node = this.document.createTextNode(text);

		this.cropAtRoot({start: index});

		this.insertAt(this.element, node, index);
	}

	getCursor() {
		if (!this.range) return;

		const segment = this.convertRangeIntoSegment(this.range);

		if (!segment) return;

		const {start, end} = segment

		return {
			start: start.index,
			end: end.index,
		}
	}

	removeFormat(position: SegmentPosition, format: EditorFormatName) {
		if (!this.hasFormat(position, format)) return;

		const oldCursor = this.getCursor();

		this.cropAtRoot(position);

		const all = this.getAllBetween(position.start, position.end || position.start);

		const allFormatted = all.filter(item => item.formats.find(segmentFormat => segmentFormat.name === format));

		allFormatted.forEach(segment => {
			segment.formats.forEach(segmentFormat => {
				if (segmentFormat.name !== format) return;

				segmentFormat.element.replaceWith(...Array.from(segmentFormat.element.childNodes));
			})
		})

		if (oldCursor) this.setCursor(oldCursor);
	}

	deleteContent(position: SegmentPosition) {
		this.element.focus();
		this.cropAtRoot(position);
		const range = this.getRange(position);

		range.segmentsBetween.forEach(segment => {
			(segment.lastParent || segment.node).remove();
		});
	}

	hasFormat(position: SegmentPosition, format: EditorFormatName) {
		const allAtPosition = this.getRange(position);

		return !!allAtPosition.segmentsBetween.find(segment => segment.formats.find(segmentFormat =>
			segmentFormat.name === format
		));
	}

	allHasFormat(position: SegmentPosition, format: EditorFormatName) {
		const allAtPosition = this.getRange(position);

		return allAtPosition.segmentsBetween.every(segment => segment.formats.find(segmentFormat =>
			segmentFormat.name === format
		));
	}

	setCursor(cursor: SegmentPosition) {
		const startSegment = this.getAt(cursor.start, true);
		const endSegment = this.getAt(cursor.end || cursor.start, true);

		const {start, end = start} = cursor;

		if (!startSegment)
			throw new Error(`The startIndex ${start} is not at editor`);

		if (!endSegment)
			throw new Error(`The endIndex ${end} is not at editor`);


		this.range?.setStart(startSegment.node, start - startSegment.start);
		this.range?.setStart(endSegment.node, end - endSegment.start);
	}

	getAll() {
		const walker = document.createTreeWalker(this.element, NodeFilter.SHOW_ALL, node => {
			if (node instanceof Text) return NodeFilter.FILTER_ACCEPT;
			if (!node.childNodes.length) return NodeFilter.FILTER_ACCEPT;
			return NodeFilter.FILTER_SKIP;
		});

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
		let subPosition = 0;

		while (walker.nextNode()) {
			const current = walker.currentNode as Text;
			const value = current.nodeValue || "";
			const isText = walker.currentNode instanceof Text;

			const hierarchy = getHierarchy(current, this.element);

			if(!isText) {
				newSegments.push({
					hierarchy,
					formats: this.helper.getElementFormats(current),
					lastParent: hierarchy.at(-1),
					positionReference: currentPosition,
					node: current,
					value,
					start: subPosition,
					end: subPosition + 1
				});

				subPosition++;
			}
			else {
				newSegments.push({
					hierarchy,
					formats: this.helper.getElementFormats(current),
					lastParent: hierarchy.at(-1),
					node: current,
					value,
					start: currentPosition,
					end: currentPosition + value.length
				});

				currentPosition += value.length;
			}
		}

		return newSegments;
	}

	private splitSegment(info: TextSegment, index: number, elementLimit: HTMLElement) {
		let firstPart: Node = info.node;
		let secondPart: Node = info.node.splitText(index);

		let parent: Node | null = info.hierarchy[0];

		if (!(parent instanceof HTMLElement)) return;
		if (parent === elementLimit) return;

		while (parent instanceof HTMLElement) {
			if (parent === elementLimit) break;

			let [leftSide, rightSide] = this.splitElement(parent, firstPart, secondPart);

			firstPart = leftSide;
			secondPart = rightSide;

			parent = leftSide.parentElement;
		}
	}

	private splitElement(element: HTMLElement, leftChild: Node, rightChild: Node) {
		let newElement = element;

		if(getComputedStyle(element).display === "block") {
			const span = this.document.createElement("span");

			span.append(...Array.from(element.childNodes).map(child => child.cloneNode(true)));

			newElement = span;
		}


		const leftSide = newElement.cloneNode();
		const rightSide = newElement.cloneNode();


		const leftChildren = [
			...this.getPreviousSiblings(leftChild),
			leftChild,
		];

		const rightChildren = [
			rightChild,
			...this.getNextSiblings(rightChild)
		];

		leftChildren.forEach(child => leftSide.appendChild(child));
		rightChildren.forEach(child => rightSide.appendChild(child));

		element.replaceWith(leftSide, rightSide);

		return [leftSide, rightSide];
	}

	private changeElement(element: HTMLElement, otherElement: HTMLElement) {
		otherElement.append(...Array.from(element.childNodes));

		element.replaceWith(element);
	}

	private getAllBetween(start: number, end: number) {
		return this.getAll().filter(segment => {
			return segment.end > start && segment.start < end
		});
	}

	private findCommonParent(start: TextSegment, end: TextSegment) {
		for (const element of start.hierarchy) {
			if (end.hierarchy.includes(element)) {
				return element;
			}
		}

		return null;
	}

	private getPreviousSiblings(node: Node) {
		const list: Node[] = [];

		let current = node;

		while (current.previousSibling) {
			list.unshift(current.previousSibling);

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

	private insertAt(reference: HTMLElement, elementToInsert: Node, index: number) {
		const segmentBeforeIndex = this.getAt(index - 1);

		const previousElement = segmentBeforeIndex?.node.parentElement === reference
			? segmentBeforeIndex.node
			: segmentBeforeIndex?.hierarchy.find(element => element.parentElement === reference);

		reference.insertBefore(elementToInsert, previousElement?.nextSibling || null)
	}

	insertElement(element: Node, index: number) {
		const cursor = this.getCursor();
		this.cropAtRoot({start: index});

		this.insertAt(this.element, element, index);

		if(cursor) this.setCursor(cursor);
	}

	private convertRangeIntoSegment = (range: Range) => {
		const segments = this.getAll();
		const allSegmentElements = segments.flatMap(segment => this.getSegmentElements(segment));

		if (!this.element.contains(range.commonAncestorContainer))
			throw new Error('The range provided is not at element');

		this.element.focus();

		const startSegment = allSegmentElements.find(segment => segment.element === range.startContainer);
		const endSegment = allSegmentElements.find(segment => segment.element === range.endContainer);

		if (!startSegment || !endSegment) return;

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

	private getSegmentElements(segment: TextSegment): TextSegmentElement[] {
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
}
