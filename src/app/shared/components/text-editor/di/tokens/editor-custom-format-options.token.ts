import { InjectionToken } from "@angular/core";
import { EditorFormat } from "../../models/editor.format";

export const EDITOR_CUSTOM_FORMAT_OPTIONS_TOKEN = new InjectionToken<EditorFormat[]>("custom-format-options-token");
