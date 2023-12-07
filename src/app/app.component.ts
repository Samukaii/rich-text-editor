import { Component, ElementRef, inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, RouterOutlet],
	signals: true,
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	@ViewChild('editor') editor!: ElementRef<HTMLElement>
	title = 'rich-text';
	zone = inject(NgZone);
	document = inject(DOCUMENT);

	currentRange?: Range;

	bold() {
		const range = this.currentRange;
		if(!range) return;
		const boldElement = this.document.createElement("STRONG");

		const parent = this.isInside(range.startContainer, "STRONG");

		if(parent) {
			range.surroundContents(document.createElement("span"));

			const startRange = new Range();
			const endRange = new Range();

			// startRange.setStart(parent, 0);
			// startRange.setEnd(parent, 1);



			endRange.setStart(parent, 2);
			endRange.setEnd(parent, 3);
			const end = endRange.extractContents();

			endRange.setStart(parent, 0);
			endRange.setEnd(parent, 1);
			const start = endRange.extractContents();

			const startBold = document.createElement("strong");
			startBold.appendChild(start);
			const endBold = document.createElement("strong");
			endBold.appendChild(end);

			parent.replaceWith(startBold, range.extractContents(),endBold)



			//
			// window.getSelection()?.addRange(startRange);
			// window.getSelection()?.removeRange(startRange);
			// window.getSelection()?.addRange(endRange);
			// window.getSelection()?.removeRange(endRange);


			// const start = this.document.createElement("STRONG");
			// const end = this.document.createElement("STRONG");
			// const beforeSelection = document.createTextNode(range.startContainer.textContent!.substring(0, range.startOffset));
			// const afterSelection = document.createTextNode(range.endContainer.textContent!.substring(range.endOffset));
			//
			// range.startContainer.parentElement?.parentNode?.insertBefore(beforeSelection, range.startContainer.parentElement);
			// range.endContainer.parentElement?.parentNode?.insertBefore(afterSelection, range.endContainer.parentElement.nextSibling);
			//
			// const strongElement = range.startContainer.parentElement!;
			// range.startContainer.parentElement?.parentNode?.removeChild(strongElement);
			//
			//
			// console.log(parent);

			return;
		}

		console.log("Remove")

		const content = range.extractContents();

		boldElement.appendChild(content);



		range.insertNode(boldElement);
	}

	isInside( node: Node | null , nodeName: string ): HTMLElement | false {
		if(!node) return false;

		if ( node?.parentElement?.nodeName === nodeName )
		{
			return node.parentElement;
		}
		else {
			return this.isInside( node.parentElement , nodeName );
		}
	}

	isBold(node: HTMLElement) {
		console.log(node.parentElement);

		return !!node.parentElement;
	}


	ngOnInit(): void {
		this.zone.runOutsideAngular(() => {
			this.document.addEventListener("selectionchange", () => {
				const selection = this.document.getSelection();
				this.currentRange = selection?.getRangeAt(0);
			});
		})
	}
}
