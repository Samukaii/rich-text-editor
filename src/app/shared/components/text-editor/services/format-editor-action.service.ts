import { inject, Injectable } from '@angular/core';
import { FormatName } from "../models/format.name";
import { TextFormatterService } from "./text-formatter.service";

@Injectable({
	providedIn: 'root'
})
export class FormatEditorActionService {
	private formatter = inject(TextFormatterService);

	applyFormat(formatName: FormatName) {

	}
}
