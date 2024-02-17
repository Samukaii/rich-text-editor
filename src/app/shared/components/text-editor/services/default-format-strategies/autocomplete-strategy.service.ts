import { inject, Injectable } from "@angular/core";
import { TextSegmentControllerService } from "../../text-segment-controller.service";
import { FormatHelperService } from "../format-helper/format-helper.service";
import { EditorFormatName } from "../../models/editor-format-name";
import { Generic } from "../../models/generic";

import { EditorFormatStrategy } from "../../models/editor-format-strategy";
import { FormatInfo } from "../text-formatter.service";

@Injectable()
export class SurroundSelectionWithSpaceStrategy implements EditorFormatStrategy {
	controller = inject(TextSegmentControllerService);
	helper = inject(FormatHelperService);

	insert(info: FormatInfo) {
		console.log("surround-selection-with-space")
		const formatName = info.format.name;
		const cursor = info.cursorPosition;

		if (this.controller.allHasFormat(cursor, formatName))
			this.controller.removeFormat(cursor, formatName);
		else {
			this.controller.removeFormat(cursor, formatName);
			this.controller.surroundWith(cursor, info.element);
			console.log(cursor);
			this.controller.insertText(" ", cursor.end);
		}

		this.controller.setCursor({
			start: cursor.start - 1
		});
	}
}
