import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { ActiveFormatsService } from "./active-formats.service";
import { group } from "@angular/animations";
import { randomBytes } from "node:crypto";

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
		name: "align:left",
		classes: "align left",
		nodeName: "div",
	},
	{
		name: "align:center",
		classes: "align center",
		nodeName: "div",
	},
	{
		name: "align:right",
		classes: "align right",
		nodeName: "div",
	},
	{
		name: "align:justify",
		classes: "align justify",
		nodeName: "div",
	},
	{
		name: "heading:normal",
		nodeName: "h1",
	},
	{
		name: "heading:1",
		nodeName: "h1",
	},
	{
		name: "heading:2",
		nodeName: "h2",
	},
	{
		name: "heading:3",
		nodeName: "h3",
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
	{
		name: "color:indigo",
		nodeName: "SPAN",
		classes: "color indigo",
	},
	{
		name: "color:cyan",
		nodeName: "SPAN",
		classes: "color cyan",
	},
	{
		name: "color:orange",
		nodeName: "SPAN",
		classes: "color orange",
	},
	{
		name: "color:blueviolet",
		nodeName: "SPAN",
		classes: "color blueviolet",
	},
	{
		name: "color:normal",
		nodeName: "SPAN",
	},
	{
		name: "background-color:red",
		nodeName: "DIV",
		classes: "background-color red",
	},
	{
		name: "background-color:blue",
		nodeName: "DIV",
		classes: "background-color blue",
	},
	{
		name: "background-color:green",
		nodeName: "DIV",
		classes: "background-color green",
	},
	{
		name: "background-color:purple",
		nodeName: "DIV",
		classes: "background-color purple",
	},
	{
		name: "background-color:indigo",
		nodeName: "DIV",
		classes: "background-color indigo",
	},
	{
		name: "background-color:cyan",
		nodeName: "DIV",
		classes: "background-color cyan",
	},
	{
		name: "background-color:orange",
		nodeName: "DIV",
		classes: "background-color orange",
	},
	{
		name: "background-color:blueviolet",
		nodeName: "DIV",
		classes: "background-color blueviolet",
	},
	{
		name: "background-color:normal",
		nodeName: "DIV",
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

export const nodeIsSomeValidFormat = (node: Node): node is Element => {
	if (!(node instanceof Element)) return false;

	return node.id.startsWith("editor-action-");
}

export const nodeIsFormat = (node: Node, formatName: FormatName) => {
	if (!nodeIsSomeValidFormat(node)) return false;

	return node.id === `editor-action-${formatName}`;
}

export const getNodeFormat = (node: Node) => {
	if (!nodeIsSomeValidFormat(node)) return null;

	return node.id.replace('editor-action-', "") as FormatName;
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
	emptyTagsException = [
		"BR",
	];

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
		const isNormalFormat = formatName.endsWith(":normal");

		if(isNormalFormat) {
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
		const newTagParent = createFormatElement(formatName);
		const content = range.extractContents();

		const group = getFormatGroup(formatName);

		if(group) this.removeFormatGroupFromChildren(content, group)
		else this.removeFormatFromTag(content, formatName);

		newTagParent.append(content)

		range.insertNode(newTagParent);
		range.selectNodeContents(newTagParent);
	}

	private overrideRangeWithFormat(range: Range, formatName: FormatName) {
		const group = getFormatGroup(formatName);

		if(!group) return;

		const tagParent = this.findAnyParentFormatOfGroup(range, group);
		if (!tagParent) return;

		const formatTag = createFormatElement(formatName);

		const [start, rangeContent, end] = this.splitRangeInElement(tagParent, range);

		formatTag.append(...Array.from(rangeContent!.childNodes));

		const newChildren: Node[] = [formatTag];

		if(start) newChildren.unshift(start);
		if(end) newChildren.push(end);

		tagParent.replaceWith(...newChildren);

		range.selectNodeContents(formatTag)
	}

	private removeFormatFromRange(range: Range, actionName: FormatName) {
		const tagParent = this.findParentFormat(range, actionName);

		if (!tagParent) return;

		const [start, rangeContent, end] = this.splitRangeInElement(tagParent, range);

		const newChildren = [start, ...Array.from(rangeContent!.childNodes), end];

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

		const [start, rangeContent, end] = this.splitRangeInElement(tagParent, range);

		this.removeFormatGroupFromChildren(rangeContent!, groupName);

		const newChildren = [start, ...Array.from(rangeContent!.childNodes), end];

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

		const rangeContent = this.isolateRange(range, element);

		const startContent = startRange.toString()
			? startRange.cloneContents()
			: null;
		const endContent = endRange.toString()
			? endRange.cloneContents()
			: null;


		return [startContent, rangeContent, endContent];
	}

	isolateRange(range: Range, elementLimit: HTMLElement) {
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

	private removeFormatGroupFromChildren(element: Node, groupName: string) {
		if(!(element instanceof Element)) return;

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
