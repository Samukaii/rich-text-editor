import { Component, computed, input } from '@angular/core';
import { JsonPipe } from "@angular/common";
import { MatRippleModule } from "@angular/material/core";

export interface BaseSelect {
	id: number;
	name: string;
}

@Component({
  selector: 'app-autocomplete',
  standalone: true,
	imports: [
		JsonPipe,
		MatRippleModule
	],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss'
})
export class AutocompleteComponent {
	list = input<BaseSelect[]>();
	onSelect = input<(item: BaseSelect) => void>();
	search = input<string>();

	searched = computed((): BaseSelect[] => {
		const list = this.list() || [];
		const search = this.search();

		return list?.filter(item => {
			return item.name.toLowerCase().includes(search?.toLowerCase().trim() || '');
		})
	})
}
