import { inject, Injectable } from '@angular/core';
import { OverlayCreatorService } from "../../services/overlay-creator/overlay-creator.service";
import { AutocompleteComponent, BaseSelect } from "./autocomplete.component";
import { OverlayCreatorOptions } from "../../services/overlay-creator/models/overlay-creator-options";

@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {
	private overlay = inject(OverlayCreatorService);
	private options?: OverlayCreatorOptions<AutocompleteComponent>;

	open(anchor: HTMLElement, list: BaseSelect[], onSelect: (item: BaseSelect) => void) {
		this.options = this.overlay.open({
			anchor,
			component: AutocompleteComponent,
			inputs: {
				list,
				onSelect
			}
		})
	}

	isOpened() {
		return !!this.options;
	}

	close() {
		this.options?.close();
		delete this.options;
	}

	search(value: string) {
		this.options?.ref.setInput('search', value);
	}
}
