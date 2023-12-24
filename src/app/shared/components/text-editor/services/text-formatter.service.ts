import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { FormatEditorService } from "./format-editor.service";
import { FormatName } from "../models/format.name";


@Injectable({
	providedIn: 'root'
})
export class TextFormatterService {
	document = inject(DOCUMENT);
	editor = inject(FormatEditorService);
	emptyTagsException = [
		"BR",
	];

	get currentRange() {
		const selection = this.document.getSelection();
		if (!selection || !selection.rangeCount) return;

		return selection.getRangeAt(0);
	}

	applyFormat(formatName: FormatName) {
		const formatGroup = this.editor.getFormatGroup(formatName);

		if(formatGroup) this.applyGroupedFormat(formatName);
		else this.applyNormalFormat(formatName);
	}

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

			if(clone instanceof Element) {
				if(first) clone.appendChild(first)
				else if(parent instanceof Element){
					clone.appendChild(range.cloneContents())
				}
				first = clone;
			}

			parent = parent.parentElement;
		}

		return first as Node;
	}

	private applyNormalFormat(formatName: FormatName) {
		const range = this.currentRange;

		if (!range) return;

		const alreadyFormatted = !!this.findParentFormat(range, formatName);

		if (!alreadyFormatted) this.surroundRangeWithFormat(range, formatName);
		else this.removeFormatFromRange(range, formatName);
	}

	private applyGroupedFormat(formatName: FormatName) {
		const range = this.currentRange;
		const formatGroup = this.editor.getFormatGroup(formatName);

		if (!range || !formatGroup) return;

		const tagParent = this.findAnyParentFormatOfGroup(range, formatGroup)
		const shouldRevertFormat = formatName.endsWith(":normal");

		if(shouldRevertFormat) {
			this.removeGroupFormatFromRange(range, formatGroup);
			return;
		}

		if (!tagParent) this.surroundRangeWithFormat(range, formatName);
		else this.overrideRangeWithFormat(range, formatName);
	}

	private mergeAllAdjacentElements(element: Element | ChildNode) {
		element.normalize();

		const children: ChildNode[] = Array.from(element.childNodes);

		if (!children.length) return;
		let currentChild: ChildNode | null = children[0];

		while (currentChild) {
			const nextChild = currentChild.nextSibling;

			if (!(currentChild instanceof Element) || !(nextChild instanceof Element)) {
				currentChild = currentChild.nextSibling;
			}
			else if (currentChild.id && nextChild.id && currentChild.id === nextChild.id){
				this.mergeChildren(currentChild, nextChild);
			}
			else currentChild = currentChild.nextSibling;

			if (currentChild) this.mergeAllAdjacentElements(currentChild);
		}
	}

	private removeAllEmptyTags(element: Element | ChildNode, exceptions = this.emptyTagsException) {
		const children: ChildNode[] = Array.from(element.childNodes);

		if (!children.length) {
			if(exceptions.includes(element.nodeName))
				return;
			if(!element.textContent)
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

	private surroundRangeWithFormat(range: Range, formatName: FormatName) {
		const newTagParent = this.editor.createElement(formatName);
		const content = range.extractContents();

		const group = this.editor.getFormatGroup(formatName);

		if(group) this.removeFormatGroupFromChildren(content, group)
		else this.removeFormatFromElement(content, formatName);

		newTagParent.append(content)

		range.insertNode(newTagParent);
		range.selectNodeContents(newTagParent);
	}

	private overrideRangeWithFormat(range: Range, formatName: FormatName) {
		const group = this.editor.getFormatGroup(formatName);

		if(!group) return;

		const tagParent = this.findAnyParentFormatOfGroup(range, group);
		if (!tagParent) return;

		const formatTag = this.editor.createElement(formatName);

		const {start, currentRange, end} = this.splitRangeInElement(tagParent, range);

		formatTag.append(...Array.from(currentRange.childNodes));

		const newChildren: Node[] = [formatTag];

		if(start) newChildren.unshift(start);
		if(end) newChildren.push(end);

		tagParent.replaceWith(...newChildren);

		range.selectNodeContents(formatTag)
	}

	private removeFormatFromRange(range: Range, actionName: FormatName) {
		const tagParent = this.findParentFormat(range, actionName);

		if (!tagParent) return;

		const {start, currentRange, end} = this.splitRangeInElement(tagParent, range);

		const newChildren = [start, ...Array.from(currentRange.childNodes), end];

		const onlyNotNull = newChildren.filter(
			(child): child is DocumentFragment => !!child
		);

		tagParent.replaceWith(...onlyNotNull);
	}

	private removeGroupFormatFromRange(range: Range, groupName: string) {
		const tagParent = this.findAnyParentFormatOfGroup(range, groupName);

		if (!tagParent) {
			const content = range.extractContents();

			this.removeFormatGroupFromChildren(content, groupName)

			range.insertNode(content);
			return
		}

		const {start, currentRange, end} = this.splitRangeInElement(tagParent, range);

		this.removeFormatGroupFromChildren(currentRange, groupName);

		const newChildren = [start, ...Array.from(currentRange!.childNodes), end];

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

	private findParentFormat(range: Range, actionName: FormatName) {
		const ancestor = range.commonAncestorContainer;

		if (this.editor.nodeIsFormat(ancestor, actionName)) return ancestor as HTMLElement;

		if (ancestor.parentElement && this.editor.nodeIsFormat(ancestor.parentElement, actionName))
			return ancestor.parentElement

		let parent = range.commonAncestorContainer.parentElement;
		let boldElement: HTMLElement | null = null;

		while (parent?.parentElement) {
			parent = parent?.parentElement!;

			if (this.editor.nodeIsFormat(parent, actionName))
				boldElement = parent;
		}

		return boldElement;
	}

	private findAnyParentFormatOfGroup(range: Range, groupName: string) {
		const ancestor = range.commonAncestorContainer;

		if (this.editor.nodeBelongsToFormatGroup(ancestor, groupName)) return ancestor as HTMLElement;

		if (ancestor.parentElement && this.editor.nodeBelongsToFormatGroup(ancestor.parentElement, groupName))
			return ancestor.parentElement

		let parent = range.commonAncestorContainer.parentElement;
		let elementWithFormat: HTMLElement | null = null;

		while (parent?.parentElement) {
			parent = parent?.parentElement!;

			if (this.editor.nodeBelongsToFormatGroup(parent, groupName))
				elementWithFormat = parent;
		}

		return elementWithFormat;
	}

	private removeFormatFromElement(element: DocumentFragment | Element, formatName: FormatName) {
		const children: Element[] = Array.from(element.children);

		if (!children.length) return;

		children.forEach(child => {
			if (this.editor.nodeIsFormat(child, formatName)) {
				child.replaceWith(...Array.from(child.childNodes))
			}

			return this.removeFormatFromElement(child, formatName)
		});
	}

	private removeFormatGroupFromChildren(element: Node, groupName: string) {
		if(!(element instanceof Element)) return;

		const children: Element[] = Array.from(element.children);

		if (!children.length) return;

		children.forEach(child => {
			if (this.editor.nodeBelongsToFormatGroup(child, groupName)) {
				child.replaceWith(...Array.from(child.childNodes))
			}

			return this.removeFormatGroupFromChildren(child, groupName)
		});
	}
}
