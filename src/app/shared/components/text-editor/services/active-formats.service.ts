import { computed, inject, Injectable, NgZone, signal } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { FormatHelperService } from "./format-helper.service";
import { FormatName } from "../models/format.name";
import { Generic } from "../models/generic";

export interface ActiveFormat {
	name: string;
	options?: Generic;
}

@Injectable({
	providedIn: 'root'
})
export class ActiveFormatsService {
	document = inject(DOCUMENT);
	zone = inject(NgZone);
	helper = inject(FormatHelperService);

	currentRange = signal<Range | null>(null);
	activeFormats = computed<ActiveFormat[]>(() => {
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

	getFormats(range: Range) {
		let formats: ActiveFormat[] = [];

		let parent: Element | null = range.commonAncestorContainer instanceof Element ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;

		while (parent && parent.id !== "text-editor") {
			const name = this.helper.getNodeFormat(parent);
			const options = this.helper.getNodeFormatOptions(parent);


			if(name) formats.push({name, options});

			parent = parent.parentElement;
		}

		return formats;
	}
}
