import { FormatInfo } from "../services/text-formatter.service";
import { EditorFormatName } from "./editor-format-name";

export interface EditorFormatStrategy<FormatName extends EditorFormatName = EditorFormatName> {
	insert: (formatInfo: FormatInfo<FormatName>) => void;
}
