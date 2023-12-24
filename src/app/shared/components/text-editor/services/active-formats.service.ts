import { computed, effect, inject, Injectable, NgZone, signal } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { FormatName, getNodeFormat, nodeIsFormat, nodeIsSomeValidFormat } from "./text-formatter.service";
import { range } from "rxjs";

@Injectable({
	providedIn: 'root'
})
export class ActiveFormatsService {
	document = inject(DOCUMENT);
	zone = inject(NgZone);

	currentRange = signal<Range | null>(null);
	activeFormats = computed<FormatName[]>(() => {
		const currentRange = this.currentRange();

		if (!currentRange) return [];

		return this.getFormats(currentRange);
	})

	watchActiveFormats() {
		this.zone.runOutsideAngular(() => {
			this.document.addEventListener('selectionchange', () => {
				this.zone.run(() => {
					this.updateActiveFormats();
								})
			})
		})
	}

	updateActiveFormats() {
		const range = this.getCurrentRange();

		this.currentRange.set(range);
	}

	private getCurrentRange() {
		const selection = this.document.getSelection();
		if (!selection || !selection.rangeCount) return null;

		return selection.getRangeAt(0)?.cloneRange();
	}

	private getFormats(range: Range) {
		let formats: FormatName[] = [];

		let parent: Element | null = range.commonAncestorContainer instanceof Element ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;

		while (parent && parent.id !== "text-editor") {
			const format = getNodeFormat(parent);
			if(format) formats.push(format);


			parent = parent.parentElement;
		}


		return formats;
	}
}
