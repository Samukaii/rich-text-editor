import { inject, Injectable } from "@angular/core";
import { TextSegmentControllerService } from "../../text-segment-controller.service";
import { FormatHelperService } from "../format-helper/format-helper.service";

import { EditorFormatStrategy } from "../../models/editor-format-strategy";
import { FormatInfo } from "../text-formatter.service";
import { AutocompleteService } from "../../../autocomplete/autocomplete.service";
import { onNodeRemove } from "../../editor-regex-format.service";

@Injectable()
export class AutocompleteStrategyService implements EditorFormatStrategy<"autocomplete"> {
	controller = inject(TextSegmentControllerService);
	helper = inject(FormatHelperService);
	autocomplete = inject(AutocompleteService);

	options = [
		{
			id: 17,
			name: "Maria"
		},
		{
			id: 65,
			name: "João"
		},
		{
			id: 18,
			name: "Romário"
		},
		{
			id: 52,
			name: "Juliana"
		},
		{
			id: 39,
			name: "Caio"
		},
		{
			id: 67,
			name: "Miguel"
		},
	]

	insert(info: FormatInfo<"autocomplete">) {
		const formatName = info.format.name;
		const options = info.format.options;
		const cursor = info.cursorPosition;

		this.controller.removeFormat(cursor, formatName);
		this.controller.surroundWith(cursor, info.element);

		if(info.text === options?.character) this.controller.insertText(" ", cursor.end);


		this.autocomplete.close();

		onNodeRemove(info.element, () => this.autocomplete.close());

		this.autocomplete.open(info.element, this.options, item => {
			this.controller.deleteContent(cursor);

			const element = this.helper.createElement("autocomplete", {
				character: options?.character ?? "@"
			})

			this.controller.insertElement(element, cursor.start);


			this.autocomplete.close();

			this.controller.setCursor({
				start: cursor.end || cursor.start
			})
		});

		this.autocomplete.search(info.text.replace(options?.character || "", "").trimEnd())

	}


}
