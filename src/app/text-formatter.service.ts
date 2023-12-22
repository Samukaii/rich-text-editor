import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from "@angular/common";

export type EditorFormat = {
	name: string;
	nodeName: string;
	classes?: string;
};

const formats = [
	{
		name: "bold",
		nodeName: "STRONG",
	},
	{
		name: "italic",
		nodeName: "EM",
	},
	{
		name: "strikethrough",
		nodeName: "S",
	},
	{
		name: "underlined",
		nodeName: "U",
	},
	{
		name: "color:red",
		nodeName: "SPAN",
		classes: "color red",
	},
	{
		name: "color:blue",
		nodeName: "SPAN",
		classes: "color blue",

	},
	{
		name: "color:green",
		nodeName: "SPAN",
		classes: "color green",

	},
	{
		name: "color:purple",
		nodeName: "SPAN",
		classes: "color purple",
	},
] as const satisfies Readonly<EditorFormat[]>;


export type FormatName = typeof formats[number]["name"];

const getFormat = (formatName: FormatName) => formats.find(format => format.name === formatName);

const createFormatElement = (name: FormatName) => {
	const format = getFormat(name);

	if (!format)
		throw new Error(`The name "${name}" is not a valid format`)

	const element = document.createElement(format.nodeName);

	element.id = `editor-action-${format.name}`;

	if ('classes' in format) element.className = format.classes;

	return element;
}

const nodeIsSomeValidFormat = (node: Node): node is Element => {
	if (!(node instanceof Element)) return false;

	return node.id.startsWith("editor-action-");
}

const nodeIsFormat = (node: Node, formatName: FormatName) => {
	if (!nodeIsSomeValidFormat(node)) return false;

	return node.id === `editor-action-${formatName}`;
}


const nodeBelongsToGroup = (node: Node, groupName: string) => {
	if (!nodeIsSomeValidFormat(node)) return false;

	const id = node.id.replace("editor-action-", "");
	const [nodeGroupName] = id.split(":");

	return nodeGroupName === groupName;
}

const getFormatGroup = (formatName: FormatName) => {
	const parts = formatName.split(":");
	if (!parts[1]) return;

	return parts[0];
}


@Injectable({
	providedIn: 'root'
})
export class TextFormatterService {
	document = inject(DOCUMENT);

	get currentRange() {
		const selection = this.document.getSelection();
		if (!selection || !selection.rangeCount) return;

		return selection.getRangeAt(0);
	}

	applyFormat(formatName: FormatName) {
		const range = this.currentRange;
		const formatGroup = getFormatGroup(formatName);

		if (!range) return;

		if(formatGroup) {
			this.applyGroupedFormat(formatName);
			return;
		}

		const tagParent = this.findParentFormat(range, formatName);

		if (!tagParent) this.surroundRangeWithFormat(range, formatName);
		else if (formatGroup) this.overrideRangeWithFormat(range, formatName);
		else this.removeFormatFromRange(range, formatName);
	}

	normalizeElement(element: Element | ChildNode) {
		this.mergeAllAdjacentElements(element);
		this.removeAllEmptyTags(element);
	}

	private applyGroupedFormat(formatName: FormatName) {
		const range = this.currentRange;
		const formatGroup = getFormatGroup(formatName);

		if (!range || !formatGroup) return;

		const tagParent = this.findAnyParentFormatOfGroup(range, formatGroup)

		if (!tagParent) this.surroundRangeWithFormat(range, formatName);
		else if (nodeIsFormat(tagParent, formatName)) this.removeFormatFromRange(range, formatName);
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
			} else if (currentChild.id === nextChild.id)
				this.mergeChildren(currentChild, nextChild);
			else currentChild = currentChild.nextSibling;

			if (currentChild) this.mergeAllAdjacentElements(currentChild);
		}
	}

	private removeAllEmptyTags(element: Element | ChildNode) {
		element.normalize();

		const children: ChildNode[] = Array.from(element.childNodes);

		if (!children.length) {
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
		const newTagParent = createFormatElement(formatName);
		const content = range.extractContents();

		const group = getFormatGroup(formatName);

		if(group) this.removeFormatGroupFromChildren(content, group)
		else this.removeFormatFromTag(content, formatName);

		newTagParent.append(content)

		range.insertNode(newTagParent);
	}

	private overrideRangeWithFormat(range: Range, formatName: FormatName) {
		const group = getFormatGroup(formatName);

		if(!group) return;

		const tagParent = this.findAnyParentFormatOfGroup(range, group);
		if (!tagParent) return;

		const formatTag = createFormatElement(formatName);

		const [start, rangeContent, end] = this.splitRangeInElement(tagParent, range);

		formatTag.appendChild(rangeContent!);

		const newChildren: (Element | DocumentFragment)[] = [formatTag];

		if(start) newChildren.unshift(start);
		if(end) newChildren.push(end);

		tagParent.replaceWith(...newChildren);
	}

	private removeFormatFromRange(range: Range, actionName: FormatName) {
		const tagParent = this.findParentFormat(range, actionName);

		if (!tagParent) return;

		const newChildren = this.splitRangeInElement(tagParent, range);
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

		const rangeContent = range.cloneContents();
		const startContent = startRange.toString()
			? startRange.cloneContents()
			: null;
		const endContent = endRange.toString()
			? endRange.cloneContents()
			: null;

		return [startContent, rangeContent, endContent];
	}

	private findParentFormat(range: Range, actionName: FormatName) {
		const ancestor = range.commonAncestorContainer;

		if (nodeIsFormat(ancestor, actionName)) return ancestor as HTMLElement;

		if (ancestor.parentElement && nodeIsFormat(ancestor.parentElement, actionName))
			return ancestor.parentElement

		let parent = range.commonAncestorContainer.parentElement;
		let boldElement: HTMLElement | null = null;

		while (parent?.parentElement) {
			parent = parent?.parentElement!;

			if (nodeIsFormat(parent, actionName))
				boldElement = parent;
		}

		return boldElement;
	}

	private findAnyParentFormatOfGroup(range: Range, groupName: string) {
		const ancestor = range.commonAncestorContainer;

		if (nodeBelongsToGroup(ancestor, groupName)) return ancestor as HTMLElement;

		if (ancestor.parentElement && nodeBelongsToGroup(ancestor.parentElement, groupName))
			return ancestor.parentElement

		let parent = range.commonAncestorContainer.parentElement;
		let boldElement: HTMLElement | null = null;

		while (parent?.parentElement) {
			parent = parent?.parentElement!;

			if (nodeBelongsToGroup(parent, groupName))
				boldElement = parent;
		}

		return boldElement;
	}

	private removeFormatFromTag(element: DocumentFragment | Element, actionName: FormatName) {
		const children: Element[] = Array.from(element.children);

		if (!children.length) return;

		children.forEach(child => {
			if (nodeIsFormat(child, actionName)) {
				child.replaceWith(...Array.from(child.childNodes))
			}

			return this.removeFormatFromTag(child, actionName)
		});
	}

	private removeFormatGroupFromChildren(element: DocumentFragment | Element, groupName: string) {
		const children: Element[] = Array.from(element.children);

		if (!children.length) return;

		children.forEach(child => {
			if (nodeBelongsToGroup(child, groupName)) {
				child.replaceWith(...Array.from(child.childNodes))
			}

			return this.removeFormatGroupFromChildren(child, groupName)
		});
	}
}
