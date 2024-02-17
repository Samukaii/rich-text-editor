import { Directive, ElementRef, HostListener, inject, Injectable } from '@angular/core';
import { first, last } from "rxjs";
import { TextFormatterService } from "./services/text-formatter.service";
import { FormatHelperService } from "./services/format-helper/format-helper.service";
import { start } from "node:repl";


type TextInfo = {
	tree: Node[];
	node: Text;
	value: string;
	start: number;
	end: number;
};

@Injectable({
	selector: '[appStrongifyText]',
	standalone: true
})
export class StrongifyTextDirective {
	formatter = inject(TextFormatterService);
	helper = inject(FormatHelperService);
	constructor(private el: ElementRef<HTMLElement>) {

	}

	@HostListener('input')
	onInput() {
		this.strongifyText();
	}

	list: string[] = [];


	private strongifyText() {
		const regex = /\*\*(.*?)\*\*/mg;

		let editor = this.el.nativeElement;

		let text = editor.textContent || '';

		const matches = Array.from(text.matchAll(regex));

		if(!matches.length) return;

		matches.forEach((match) => {
			const start = (match.index || 0) + 2;
			const end = start + match[1].length;

			console.log(match[0], start, end, this.isBold(start, end))

			if(this.isBold(start, end)) return;

			this.cropElement(editor, start, end);
			this.bold(editor, start, end);
		});


	}
	removeNonMatchingBold() {
		const info = this.boldInfo(this.el.nativeElement);

		const getBold = (info: TextInfo) => {
			return info.tree.filter(parent =>
				this.helper.nodeIsFormat(parent, 'bold') && this.helper.nodeIsRegexFormat(parent))[0]
		};

		const bolds = info.map(info => info.tree.filter(parent =>
			this.helper.nodeIsFormat(parent, 'bold') && this.helper.nodeIsRegexFormat(parent))[0]);

		info.forEach(item => {

		});
	}

	boldInfo(element: HTMLElement) {
		const textInfo = this.getElementInfo(element);

		return textInfo.filter(info => info.tree.some(parent =>
			this.helper.nodeIsFormat(parent, 'bold') && this.helper.nodeIsRegexFormat(parent))
		)
	}


	isBold(start: number, end: number) {
		const boldInfo = this.boldInfo(this.el.nativeElement);

		return boldInfo.some(info => info.start === start && info.end === end);
	}

	getElementInfo(element: HTMLElement) {
		const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

		let currentPosition = 0;

		const getNodeTree = (node: Node, limit: Node | null = null, tree: Node[] = []): Node[] => {
			if(!node.parentElement || node.parentElement === limit) return tree;

			return [
				...tree,
				node.parentElement,
				...getNodeTree(node.parentElement, limit, tree)
			]
		}

		const info: TextInfo[] = [];


		while (walker.nextNode()) {
			const current = walker.currentNode as Text;
			const value = current.nodeValue || "";

			info.push({
				tree: getNodeTree(current, element),
				node: current,
				value,
				start: currentPosition,
				end: currentPosition + value.length
			});

			currentPosition += value.length;
		}

		return info;
	}

	cropElement(element: HTMLElement, start: number, end: number) {
		let info = this.getElementInfo(element);

		let first = info.find(item => start > item.start && start < item.end);

		if(first) this.crop(first, start - first.start);

		info = this.getElementInfo(element);

		let last = info.find(item => end > item.start && end < item.end);

		if(last) this.crop(last, end - last.start);
	}

	insertAt(element: HTMLElement, elementToInsert: HTMLElement, index: number) {
		const info = this.getElementInfo(element);
		const before = info.find(a => a.end === index);

		if(before) {
			const a = (before.tree[before.tree.length - 1] || before.node) as Text;

			if (a.nextSibling) {
				a.parentElement?.insertBefore(elementToInsert, a.nextSibling);
			} else {
				a.parentElement?.appendChild(elementToInsert);
			}
		}

		document.getSelection()?.getRangeAt(0).setStartAfter(elementToInsert);
		document.getSelection()?.getRangeAt(0).setEndAfter(elementToInsert);

	}

	bold(element: HTMLElement, start: number, end: number) {
		let info = this.getElementInfo(element);

		const strong = this.helper.createRegexElement('bold');

		const nodes = info.filter(info => info.start >= start && info.end <= end);

		const all = nodes.map(node => node.tree[node.tree.length - 1] || node.node)
			.filter((value, index, array) => array.indexOf(value) === index);

		strong.append(...all);

		this.formatter.removeFormatFromElement(strong, 'bold');

		this.insertAt(element, strong, start);
	}

	crop(info: TextInfo, index: number){
		let firstPart: Node = info.node;
		let secondPart: Node = info.node.splitText(index);

		let parent: Node | null = info.tree[0];

		if(!(parent instanceof HTMLElement)) return;
		if(parent === this.el.nativeElement) return;

		let result = this.cropParent(parent, firstPart, secondPart);

		firstPart = result[0];
		secondPart = result[1];

		parent = result[0].parentElement;

		if(!(parent instanceof HTMLElement)) return;
		if(parent === this.el.nativeElement) return;


		result = this.cropParent(parent, firstPart, secondPart);

		firstPart = result[0];
		secondPart = result[1];

		parent = result[0].parentElement;

		if(!(parent instanceof HTMLElement)) return;
		if(parent === this.el.nativeElement) return;


		this.cropParent(parent, firstPart, secondPart);
	}

	cropParent(parent: HTMLElement, firstPart: Node, secondPart: Node) {
		const a = parent.cloneNode();
		const b = parent.cloneNode();

		const before = [
			...this.getPreviousSiblings(firstPart),
			firstPart,
		];

		const after = [
			secondPart,
			...this.getNextSiblings(secondPart)
		];

		before.forEach(child => a.appendChild(child));
		after.forEach(child => b.appendChild(child));

		parent.replaceWith(a, b);

		return [a, b];
	}

	getPreviousSiblings(node: Node) {
		const list: Node[] = [];

		let current = node;

		while (current.previousSibling) {
			list.push(current.previousSibling);

			current = current.previousSibling;
		}

		return list;
	}

	getNextSiblings(node: Node) {
		const list: Node[] = [];

		let current = node;

		while (current.nextSibling) {
			list.push(current.nextSibling);

			current = current.nextSibling;
		}

		return list;
	}
}
