import { inject, Injectable } from "@angular/core";
import { TextSegmentControllerService } from "../../text-segment-controller.service";
import { FormatHelperService } from "../format-helper/format-helper.service";

import { EditorFormatStrategy } from "../../models/editor-format-strategy";
import { FormatInfo } from "../text-formatter.service";

@Injectable()
export class SurroundSelectionStrategy implements EditorFormatStrategy {
	controller = inject(TextSegmentControllerService);
	helper = inject(FormatHelperService);

	insert(info: FormatInfo) {
		const formatName = info.format.name;

		const cursor = info.cursorPosition;

		if (!cursor) return;

		if (this.controller.allHasFormat(cursor, formatName))
			this.controller.removeFormat(cursor, formatName);
		else {
			this.controller.removeFormat(cursor, formatName);
			this.controller.surroundWith(cursor, info.element);
		}

		this.controller.setCursor(cursor);
	}
}
