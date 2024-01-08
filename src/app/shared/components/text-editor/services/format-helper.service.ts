import { inject, Injectable } from '@angular/core';
import { allTextFormats } from "../static/all-text-formats";

import { FormatBlockName, FormatName } from "../models/format.name";
import { DOCUMENT } from "@angular/common";
import { waitImageLoad } from "../../../functions/wait-image-load";
import { allTextBlocks } from "../static/all-text-blocks";
import { FormatBlockChild } from "../models/editor.format";
import { Generic } from "../models/generic";
import { keyframes } from "@angular/animations";


type ValidValue = string | number | null | undefined | boolean;
interface ValidOptions {
	[key: string]: ValidValue | ValidValue[] | ValidOptions;
}




@Injectable({
	providedIn: 'root'
})
export class FormatHelperService {
	private document = inject(DOCUMENT);
	private editorPrefix = "editor-format-";
	private editorOptionsAttribute = "data-editor-options";

	getFormat(formatName: FormatName) {
		return allTextFormats.find(format => format.name === formatName);
	}

	createElement(name: FormatName, options?: Generic) {
		const format = this.getFormat(name);

		if (!format)
			throw new Error(`The name "${name}" is not a valid format`)

		const element = document.createElement(format.nodeName);

		if('modifier' in format)
			format.modifier(element, {
				formatOptions: options || {},
				editor: {
					createFormat: this.createElement.bind(this)
				}
			});

		element.id = `${this.editorPrefix}${format.name}`;
		if(options) {
			element.setAttribute(this.editorOptionsAttribute, this.identifyByOptions(options))
		}

		return element;
	}

	private identifyByOptions(options: Generic) {
		if(!this.isValidOptions(options)) {
			const error = new Error();
			error.name = "The options provided are not valid";
			error.message = "Valid options can only contain primitive values";

			throw error;
		}

		return JSON.stringify(options);
	}

	private isValidOptions(options: Generic): options is ValidOptions {
		return Object.keys(options).every(key => {
			const value = options[key];

			const validTypes = [
				"string",
				"number",
				"boolean"
			];

			if(validTypes.includes(typeof value) || value === null)
				return true;

			if(typeof value === "object") return this.isValidOptions(value);

			return !!Array.isArray(value);
		});
	}

	createBlock(blockName: FormatBlockName) {
		const block = this.getBlock(blockName);
		if(!block)
			throw new Error(`Block "${blockName}" is not a valid format block`);

		const elementBlock = this.document.createElement(block.nodeName);
		elementBlock.id = `${this.editorPrefix}block-${blockName}`
		elementBlock.setAttribute('contentEditable', 'false');

		block.children.forEach(child => {
			elementBlock.appendChild(this.createBlockChild(child));
		})

		return elementBlock
	}

	private createBlockChild(child: FormatBlockChild) {
		if(typeof child === "string")
			return this.createElement(child);

		let childElement = this.createElement(child.format);

		if(!child.children?.length) return childElement;

		child.children.forEach((childChild: any) =>
			childElement.appendChild(this.createBlockChild(childChild))
		);

		return childElement;
	}

	getBlock(blockName: FormatBlockName) {
		return allTextBlocks.find(block => block.name === blockName);
	}

	findFormatOnChildren(element: Element, format: FormatName) {
		const id = `${this.editorPrefix}${format}`;

		let elementFound: HTMLElement | undefined;

		Array.from(element.children).forEach(child => {
			if(child.id === id) elementFound = child as HTMLElement;
			else elementFound = this.findFormatOnChildren(child, format);
		});

		return elementFound;
	}

	findFormatGroupOnChildren(element: Element, group: string): HTMLElement | undefined {
		const id = `${this.editorPrefix}${group}`;

		let elementFound: HTMLElement | undefined;

		Array.from(element.children).forEach(child => {
			if(child.id.startsWith(id)) elementFound = child as HTMLElement;
			else elementFound = this.findFormatGroupOnChildren(child, group);
		});

		return elementFound;
	}

	findFormatOnParent(element: HTMLElement, format: FormatName) {
		const id = `${this.editorPrefix}${format}`;
		let parent = element.parentElement;

		while (parent && parent.id !== id) {
			parent = parent.parentElement;
		}

		return parent;
	}

	findBlockOnParent(element: HTMLElement, format: FormatBlockName) {
		const id = `${this.editorPrefix}block-${format}`;

		let parent = element.parentElement;

		while (parent && parent.id !== id) {
			parent = parent.parentElement;
		}

		return parent;
	}

	createWhiteSpace() {
		const whiteSpace = this.document.createElement('div');

		whiteSpace.appendChild(this.document.createElement('br'));

		return whiteSpace;
	}

	changeElementOptions(element: HTMLElement, options?: Generic) {
		if(!this.nodeIsSomeValidFormat(element))
			throw new Error("This element is not a valid format");

		const formatName = this.getNodeFormat(element)!;
		const format = this.getFormat(formatName)!;

		if('modifier' in format)
			format.modifier(element, {
				formatOptions: options || {},
				editor: {
					createFormat: this.createElement.bind(this)
				}
			});
	}

	hasSameFormat(first: Element, second: Element) {
		if(!this.nodeIsSomeValidFormat(first)) return false;
		if(!this.nodeIsSomeValidFormat(second)) return false;
		const firstOptions = first.getAttribute(this.editorOptionsAttribute);
		const secondOptions = second.getAttribute(this.editorOptionsAttribute);

		return first.id === second.id && firstOptions === secondOptions;
	}

	createListItem(content: Node | string) {
		const li = this.document.createElement("li");

		if(typeof content === "string")
			li.appendChild(this.document.createTextNode(content));
		else li.appendChild(content);

		return li;
	}

	nodeIsSomeValidFormat(node: Node): node is Element {
		if (!(node instanceof Element)) return false;

		return node.id.startsWith(this.editorPrefix);
	}

	nodeIsFormat(node: Node, formatName: FormatName) {
		if (!this.nodeIsSomeValidFormat(node)) return false;

		return node.id === `${this.editorPrefix}${formatName}`;
	}

	getNodeFormat(node: Node) {
		if (!this.nodeIsSomeValidFormat(node)) return null;

		return node.id.replace(this.editorPrefix, "") as FormatName;
	}

	getNodeFormatOptions(node: Node) {
		if (!this.nodeIsSomeValidFormat(node)) return null;

		const options = node.getAttribute(this.editorOptionsAttribute);

		if(!options) return;

		return JSON.parse(options);
	}

	nodeBelongsToFormatGroup(node: Node, groupName: string) {
		if (!this.nodeIsSomeValidFormat(node)) return false;

		const id = node.id.replace(this.editorPrefix, "");
		const [nodeGroupName] = id.split(":");

		return nodeGroupName === groupName;
	}

	getFormatGroup(formatName: FormatName)  {
		const parts = formatName.split(":");
		if (!parts[1]) return;

		return parts[0];
	}

	isListLike(formatName: FormatName)  {
		const parts = formatName.split(":");
		if (!parts[1]) return;

		return parts[0] === "list";
	}
}
