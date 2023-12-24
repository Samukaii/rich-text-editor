import { Injectable } from '@angular/core';
import { allTextFormats } from "../static/all-text-formats";

import { FormatName } from "../models/format.name";

@Injectable({
	providedIn: 'root'
})
export class FormatEditorService {

	getFormat(formatName: FormatName) {
		return allTextFormats.find(format => format.name === formatName);
	}

	createElement(name: FormatName) {
		const format = this.getFormat(name);

		if (!format)
			throw new Error(`The name "${name}" is not a valid format`)

		const element = document.createElement(format.nodeName);

		element.id = `editor-action-${format.name}`;

		if ('classes' in format) element.className = format.classes;

		return element;
	}

	nodeIsSomeValidFormat(node: Node): node is Element {
		if (!(node instanceof Element)) return false;

		return node.id.startsWith("editor-action-");
	}

	nodeIsFormat(node: Node, formatName: FormatName) {
		if (!this.nodeIsSomeValidFormat(node)) return false;

		return node.id === `editor-action-${formatName}`;
	}

	getNodeFormat(node: Node) {
		if (!this.nodeIsSomeValidFormat(node)) return null;

		return node.id.replace('editor-action-', "") as FormatName;
	}

	nodeBelongsToFormatGroup(node: Node, groupName: string) {
		if (!this.nodeIsSomeValidFormat(node)) return false;

		const id = node.id.replace("editor-action-", "");
		const [nodeGroupName] = id.split(":");

		return nodeGroupName === groupName;
	}

	getFormatGroup(formatName: FormatName)  {
		const parts = formatName.split(":");
		if (!parts[1]) return;

		return parts[0];
	}
}
