import { inject, Injectable } from "@angular/core";
import { TextSegmentControllerService } from "../../text-segment-controller.service";
import { FormatHelperService } from "../format-helper/format-helper.service";
import { EditorFormatName } from "../../models/editor-format-name";
import { Generic } from "../../models/generic";

import { EditorFormatStrategy } from "../../models/editor-format-strategy";
import { FormatInfo } from "../text-formatter.service";

@Injectable()
export class InsertInNewLineStrategy implements EditorFormatStrategy {
	controller = inject(TextSegmentControllerService);
	helper = inject(FormatHelperService);

	insert(info: FormatInfo) {
		this.controller.insertElement(info.element, info.cursorPosition.start);
	}

}
