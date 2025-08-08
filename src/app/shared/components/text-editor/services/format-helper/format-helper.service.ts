import { Injectable } from '@angular/core';
import { Generic } from "../../models/generic";
import { FormatEditorValidOptions } from "./models/format-editor-valid.options";
import { EditorFormatName } from "../../models/editor-format-name";
import { EditorFormatOptions } from "../../models/editor-format-options";
import { CustomFormat } from "../../models/custom-format";
import { injectAllFormatOptions } from "../../di/functions/inject-all-format-options";


@Injectable({
	providedIn: 'root'
})
export class FormatHelperService {
	private editorPrefix = "editor-format-";
	private editorOptionsAttribute = "data-editor-options";
	private allFormatOptions = injectAllFormatOptions();

	getFormat<Name extends EditorFormatName>(formatName: Name) {
		return this.allFormatOptions.find(
			format => format.name === formatName
		) as CustomFormat<Name> | undefined;
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

		if(format.editable === false)
			element.setAttribute("contentEditable", "false");

		if(options) {
			element.setAttribute(this.editorOptionsAttribute, this.identifyByOptions(options))
		}

		return element;
	}

	createRegexElement<Name extends EditorFormatName>(name: Name, options?: EditorFormatOptions<Name>) {
		const element = this.createElement(name, options);

		element.setAttribute('data-editor-regex-format', "true");

		return element;
	}

	nodeIsRegexFormat(element: Node) {
		if(!this.nodeIsSomeValidFormat(element)) return false;

		return element.getAttribute('data-editor-regex-format') === "true";
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

	findFormatOnChildren(element: Element, format: EditorFormatName) {
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

	findFormatOnParent(element: HTMLElement, format: EditorFormatName) {
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

	nodeIsFormat(node: Node, formatName: EditorFormatName) {
		if (!this.nodeIsSomeValidFormat(node)) return false;

		return node.id === `${this.editorPrefix}${formatName}`;
	}

	getNodeFormat(node: Node) {
		if (!this.nodeIsSomeValidFormat(node)) return null;

		return node.id.replace(this.editorPrefix, "") as EditorFormatName;
	}

	getNodeFormatOptions(node: Node) {
		if (!this.nodeIsSomeValidFormat(node)) return null;

		const options = node.getAttribute(this.editorOptionsAttribute);

		if(!options) return;

		return JSON.parse(options);
	}
}
