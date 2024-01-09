import { inject, Injectable } from '@angular/core';
import { allTextFormats } from "../../static/all-text-formats";

import { FormatName } from "../../models/format.name";
import { DOCUMENT } from "@angular/common";
import { Generic } from "../../models/generic";
import { FormatEditorValidOptions } from "./models/format-editor-valid.options";
import { EditorFormatName } from "../../models/editor-format-name";
import { EditorFormatOptions } from "../../models/editor-format-options";
import { EditorFormat } from "../../models/editor.format";


@Injectable({
	providedIn: 'root'
})
export class FormatHelperService {
	private document = inject(DOCUMENT);
	private editorPrefix = "editor-format-";
	private editorOptionsAttribute = "data-editor-options";

	getFormat<Name extends EditorFormatName>(formatName: Name) {
		return allTextFormats.find(
			format => format.name === formatName
		) as EditorFormat<Name> | undefined;
	}

	createElement<Name extends EditorFormatName>(name: Name, options?: EditorFormatOptions<Name>) {
		const format = this.getFormat(name);

		if (!format)
			throw new Error(`The name "${name}" is not a valid format`)

		const element = document.createElement(format.nodeName);

		if('modifier' in format)
			format.modifier?.(element, {
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

	private isValidOptions(options: Generic): options is FormatEditorValidOptions {
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

	changeElementOptions(element: HTMLElement, options?: Generic) {
		if(!this.nodeIsSomeValidFormat(element))
			throw new Error("This element is not a valid format");

		const formatName = this.getNodeFormat(element)!;
		const format = this.getFormat(formatName)!;

		if('modifier' in format)
			format.modifier?.(element, {
				formatOptions: options || {},
				editor: {
					createFormat: this.createElement.bind(this)
				}
			});
	}

	compareOptions(first: Generic, second: Generic) {
		const firstID = this.identifyByOptions(first);
		const secondId = this.identifyByOptions(second);

		return firstID === secondId;
	}

	hasSameFormat(first: Element, second: Element) {
		if(!this.nodeIsSomeValidFormat(first)) return false;
		if(!this.nodeIsSomeValidFormat(second)) return false;
		const firstOptions = first.getAttribute(this.editorOptionsAttribute);
		const secondOptions = second.getAttribute(this.editorOptionsAttribute);

		return first.id === second.id && firstOptions === secondOptions;
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
}
