import { computed, Injectable, signal } from '@angular/core';
import { Observable, tap } from "rxjs";


@Injectable({
	providedIn: 'root'
})
export class EditorEventsService {
	private editorChanges = signal<MutationRecord[]>([]);
	private editor?: HTMLElement;

	watchEditorChanges$(editor: HTMLElement) {
		this.editor = editor;

		return this.watchElementMutations(editor).pipe(
			tap(mutations => this.editorChanges.set(mutations))
		);
	}

	existsOnEditor(element: HTMLElement) {
		return computed(() => {
			this.editorChanges();

			return !!this.editor?.contains(element);
		});
	}

	private watchElementMutations(element: HTMLElement) {
		return new Observable<MutationRecord[]>(observer => {
			const mutationObserver = new MutationObserver(mutations => {
				observer.next(mutations);
			});

			mutationObserver.observe(element, {childList: true, subtree: true});

			return () => mutationObserver.disconnect();
		});
	}
}
