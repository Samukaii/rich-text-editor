import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import exp from "node:constants";

const formats = {
	bold: {
		nodeName: "STRONG",
		classes: "",
		id: "",
	},
	italic: {
		nodeName: "EM",
		classes: "",
		id: "",
	},
	strikethrough: {
		nodeName: "S",
		classes: "",
		id: "",
	},
	underlined: {
		nodeName: "U",
		classes: "",
		id: "",
	},
	red: {
		nodeName: "SPAN",
		classes: "red",
		id: "",
	},
	blue: {
		nodeName: "SPAN",
		classes: "blue",
		id: "",
	},
};

export type FormatName = keyof typeof formats;

const getFormat = (name: FormatName) => formats[name];

const createFormatElement = (name: FormatName) => {
	const format = formats[name];

	const element = document.createElement(format.nodeName);

	if(format.classes) element.className = format.classes;
	if(format.id) element.id = format.id;

	return element;
}

const isFormat = (node: Node, formatName: FormatName) => {
	const format = getFormat(formatName);

	if(!(node instanceof Element)) return false;

	const conditions = [
		node.nodeName === format.nodeName
	];

	if(format.classes) conditions.push(
		node.className.includes(format.classes)
	);

	if(format.id) conditions.push(
		node.id === format.id
	);

	return conditions.every(Boolean);
}

@Injectable({
  providedIn: 'root'
})
export class TextFormatterService {
	document = inject(DOCUMENT);

	get currentRange() {
		const selection = this.document.getSelection();
		if(!selection || !selection.rangeCount) return;

		return selection.getRangeAt(0);
	}

	applyFormat(formatName: FormatName) {
		const range = this.currentRange;

		if(!range) return;

		const tagParent = this.findParentTag(range, formatName);

		if(!tagParent) this.surroundRangeWithTag(range, formatName);
		else this.removeTagFromRange(range, formatName);
	}

	mergeAllAdjacentElements(element: Element | ChildNode) {
		element.normalize();

		const children: ChildNode[] = Array.from(element.childNodes);

		if(!children.length) return;

		children.forEach((currentChild, index) => {
			const nextChild = children[index + 1];

			if(currentChild.nodeName === nextChild?.nodeName)
				this.mergeChildren(currentChild, nextChild);

			this.mergeAllAdjacentElements(currentChild);
		})
	}

	private mergeChildren(first: ChildNode, second: ChildNode) {
		if(!(first instanceof Element) || !second) return;

		const current = Array.from(first.childNodes)
		const next = Array.from(second.childNodes);

		first.replaceChildren(...current, ...next);
		second.remove();
		first.normalize();
	}

	private surroundRangeWithTag(range: Range, formatName: FormatName) {
		const newTagParent = createFormatElement(formatName);
		const content = range.extractContents();

		this.removeChildrenTag(content, formatName);

		newTagParent.append(content)

		range.insertNode(newTagParent);
	}

	private removeTagFromRange(range: Range, formatName: FormatName) {
		const tagParent = this.findParentTag(range, formatName);

		if(!tagParent) return;


		const startRange = new Range();
		const endRange = new Range();

		startRange.setStartBefore(tagParent);
		startRange.setEnd(range.startContainer, range.startOffset);

		endRange.setStart(range.endContainer, range.endOffset);
		endRange.setEndAfter(tagParent);

		const newChildren = [range.cloneContents()];

		if(!!startRange.toString()) newChildren.unshift(startRange.cloneContents());
		if(!!endRange.toString()) newChildren.push(endRange.cloneContents());

		tagParent.replaceWith(...newChildren);
	}

	private findParentTag(range: Range, formatName: FormatName) {
		const ancestor = range.commonAncestorContainer;

		if(isFormat(ancestor, formatName)) return ancestor as HTMLElement;

		if(ancestor.parentElement && isFormat(ancestor.parentElement, formatName))
			return ancestor.parentElement

		let parent = range.commonAncestorContainer.parentElement;
		let boldElement: HTMLElement | null = null;

		while (parent?.parentElement) {
			parent = parent?.parentElement!;

			if(isFormat(parent, formatName))
				boldElement = parent;
		}

		return boldElement;
	}

	private removeChildrenTag(element: DocumentFragment | Element, formatName: FormatName) {
		const children: Element[] = Array.from(element.children);

		if(!children.length) return;

		children.forEach(child => {
			if(isFormat(child, formatName)) {
				child.replaceWith(...Array.from(child.childNodes))
			}

			return this.removeChildrenTag(child, formatName)
		});
	}
}
