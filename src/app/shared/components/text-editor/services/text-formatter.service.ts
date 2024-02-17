import { inject, Injectable, InjectableType, InjectionToken, Injector } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { FormatHelperService } from "./format-helper/format-helper.service";
import { Generic } from "../models/generic";
import { EditorEventsService } from "./editor-events.service";
import { EditorFormatName } from "../models/editor-format-name";
import { TextSegmentControllerService } from "../text-segment-controller.service";
import { defaultEditorInsertionStrategy } from "../static/default-editor-insertion-strategy";
import { EditorFormatStrategy } from "../models/editor-format-strategy";
import { EditorFormatOptions } from "../models/editor-format-options";

export interface FormatInfo<FormatName extends EditorFormatName = EditorFormatName> {
	element: HTMLElement;
	text: string;
	cursorPosition: {
		start: number;
		end: number;
	},
	format: {
		name: FormatName;
		options?: EditorFormatOptions<FormatName>;
	};
}

@Injectable()
export class TextFormatterService {
	document = inject(DOCUMENT);
	helper = inject(FormatHelperService);
	editor = inject(EditorEventsService);
	controller = inject(TextSegmentControllerService);
	injector = inject(Injector);

	emptyNodeException = [
		"br",
		"#text-editor",
		"img"
	];

	get currentRange() {
		const selection = this.document.getSelection();
		if (!selection || !selection.rangeCount) return;

		return selection.getRangeAt(0);
	}

	applyFormat(formatName: EditorFormatName, options?: Generic) {
		const strategy = this.getStrategy(formatName);

		const format = this.helper.getFormat(formatName);
		const cursorPosition = this.controller.getCursor();

		if (!format || !cursorPosition) return;

		const element = this.helper.createElement(formatName, options);
		const text = this.controller.getText(cursorPosition);

		strategy.insert({
			element,
			text,
			cursorPosition,
			format: {
				name: formatName,
				options: options
			}
		});

		return element;
	}

	applyRegexFormat(position: { start: number; end: number }, formatName: EditorFormatName, options?: Generic) {
		const strategy = this.getStrategy(formatName);

		const format = this.helper.getFormat(formatName);

		if (!format) return;

		const element = this.helper.createRegexElement(formatName, options);
		const text = this.controller.getText(position);

		strategy.insert({
			element,
			text,
			cursorPosition: position,
			format: {
				name: formatName,
				options: options
			}
		});

		return element;
	}

	private getStrategy(formatName: EditorFormatName): EditorFormatStrategy {
		const format = this.helper.getFormat(formatName);

		if (!format)
			throw new Error('No format');

		const token = new InjectionToken<EditorFormatStrategy>('insertion-strategy');

		const strategyClass = typeof format?.formatStrategy === "string"
			? defaultEditorInsertionStrategy[format.formatStrategy]
			: format?.formatStrategy as InjectableType<EditorFormatStrategy>;

		const injector = Injector.create({
			parent: this.injector,
			providers: [
				{
					provide: token,
					useClass: strategyClass
				}
			]
		});

		return injector.get(token);
	}


	applyFormat2(formatName: EditorFormatName, options?: Generic) {
		const format = this.helper.getFormat(formatName);

		if (!format) return;

		// switch (format.formatStrategy) {
		// 	case "surround-selection":
		// 		this.applyNormalFormat(formatName, options);
		// 		break;
		// 	case "insert-in-new-line":
		// 		this.insert(formatName, options);
		// 		break;
		// }
	}

	removeFormat(formatName: EditorFormatName) {
		const range = this.currentRange;
		if (!range) return;

		this.removeFormatFromRange(range, formatName);
	}

	// insert(formatName: EditorFormatName, options?: Generic) {
	// 	const element = this.helper.createElement(formatName, options);
	//
	// 	this.currentRange?.insertNode(element);
	// }

	normalizeElement(element: Element | ChildNode) {
		this.mergeAllAdjacentElements(element);
		this.removeAllEmptyTags(element);
	}

	private copyElementFromRange(range: Range, elementLimit: HTMLElement) {
		const nodes: Node[] = [];
		let first: Node | null = null;

		let parent: Node | null = range.commonAncestorContainer;

		while (parent && !nodes.includes(elementLimit)) {
			nodes.push(parent);

			const clone = parent.cloneNode();
			clone.childNodes.forEach(child => child.remove());

			if (clone instanceof Element) {
				if (first) clone.appendChild(first)
				else if (parent instanceof Element) {
					clone.appendChild(range.cloneContents())
				}
				first = clone;
			}

			parent = parent.parentElement;
		}

		return first as Node;
	}

	// private applyNormalFormat(formatName: EditorFormatName, options?: Generic) {
	// 	const range = this.currentRange;
	// 	const format = this.helper.getFormat(formatName);
	//
	// 	if (!range || !format) return;
	//
	// 	const alreadyFormatted = !!this.findParentFormat(range, formatName);
	//
	// 	if (alreadyFormatted) {
	// 		if ('autoRemove' in format) this.removeFormat(formatName);
	// 		else this.overrideRangeWithFormat(range, formatName, options);
	// 	} else this.surroundRangeWithFormat(range, formatName, options);
	// }

	private mergeAllAdjacentElements(element: Element | ChildNode) {
		element.normalize();

		const children: ChildNode[] = Array.from(element.childNodes);

		if (!children.length) return;
		let currentChild: ChildNode | null = children[0];

		while (currentChild) {
			const nextChild = currentChild.nextSibling;

			if (!(currentChild instanceof Element) || !(nextChild instanceof Element)) {
				currentChild = currentChild.nextSibling;
			} else if (this.helper.hasSameFormat(currentChild, nextChild)) {
				this.mergeChildren(currentChild, nextChild);
			} else currentChild = currentChild.nextSibling;

			if (currentChild) this.mergeAllAdjacentElements(currentChild);
		}
	}

	includedInExceptions(node: Node, emptyExceptions = this.emptyNodeException) {
		return emptyExceptions.some(exception => {
			if (!(node instanceof HTMLElement)) return;

			return node.matches(exception)
		})
	}

	private removeAllEmptyTags(element: Element | ChildNode, exceptions = this.emptyNodeException) {
		const children: ChildNode[] = Array.from(element.childNodes);

		if (!children.length) {
			if (this.includedInExceptions(element, exceptions))
				return;
			if (!element.textContent)
				element.remove();
			return;
		}

		children.forEach(child => this.removeAllEmptyTags(child));
	}

	private mergeChildren(first: ChildNode, second: ChildNode) {
		if (!(first instanceof Element) || !second) return;

		const current = Array.from(first.childNodes)
		const next = Array.from(second.childNodes);

		first.replaceChildren(...current, ...next);
		second.remove();
		first.normalize();
	}

	//
	// private surroundRangeWithFormat(range: Range, formatName: EditorFormatName, options?: Generic) {
	// 	const newTagParent = this.helper.createElement(formatName, options);
	// 	const content = range.extractContents();
	//
	// 	this.removeFormatFromElement(content, formatName);
	//
	// 	newTagParent.append(content)
	//
	// 	range.insertNode(newTagParent);
	// 	range.selectNodeContents(newTagParent);
	// }
	//
	// private overrideRangeWithFormat(range: Range, formatName: EditorFormatName, options?: Generic) {
	// 	const tagParent = this.findParentFormat(range, formatName);
	// 	if (!tagParent) return;
	//
	// 	const formatTag = this.helper.createElement(formatName, options);
	//
	// 	const {start, currentRange, end} = this.splitRangeInElement(tagParent, range);
	//
	// 	formatTag.append(...Array.from(currentRange.childNodes));
	// 	this.removeFormatFromElement(formatTag, formatName);
	//
	// 	const newChildren: Node[] = [formatTag];
	//
	// 	if (start) newChildren.unshift(start);
	// 	if (end) newChildren.push(end);
	//
	// 	tagParent.replaceWith(...newChildren);
	//
	// 	range.selectNodeContents(formatTag)
	// }

	private removeFormatFromRange(range: Range, actionName: EditorFormatName) {
		const tagParent = this.findParentFormat(range, actionName);

		if (!tagParent) return;

		const {start, currentRange, end} = this.splitRangeInElement(tagParent, range);

		const newChildren = [start, ...Array.from(currentRange.childNodes), end];

		const onlyNotNull = newChildren.filter(
			(child): child is DocumentFragment => !!child
		);

		tagParent.replaceWith(...onlyNotNull);
	}

	private splitRangeInElement(element: HTMLElement, range: Range) {
		const startRange = new Range();
		const endRange = new Range();

		startRange.setStartBefore(element);
		startRange.setEnd(range.startContainer, range.startOffset);

		endRange.setStart(range.endContainer, range.endOffset);
		endRange.setEndAfter(element);

		const rangeContent = this.copyElementFromRange(range, element);

		const startContent = startRange.toString()
			? startRange.cloneContents()
			: null;
		const endContent = endRange.toString()
			? endRange.cloneContents()
			: null;

		return {
			start: startContent,
			currentRange: rangeContent,
			end: endContent,
		}
	}

	private findParentFormat(range: Range, actionName: EditorFormatName) {
		const ancestor = range.commonAncestorContainer;

		if (this.helper.nodeIsFormat(ancestor, actionName)) return ancestor as HTMLElement;

		if (ancestor.parentElement && this.helper.nodeIsFormat(ancestor.parentElement, actionName))
			return ancestor.parentElement

		let parent = range.commonAncestorContainer.parentElement;
		let boldElement: HTMLElement | null = null;

		while (parent?.parentElement) {
			parent = parent?.parentElement!;

			if (this.helper.nodeIsFormat(parent, actionName))
				boldElement = parent;
		}

		return boldElement;
	}

	removeFormatFromElement(element: DocumentFragment | Element, formatName: EditorFormatName) {
		const children: Element[] = Array.from(element.children);

		if (!children.length) return;

		children.forEach(child => {
			if (this.helper.nodeIsFormat(child, formatName)) {
				child.replaceWith(...Array.from(child.childNodes))
			}

			return this.removeFormatFromElement(child, formatName)
		});
	}
}
