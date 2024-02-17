import { InjectionToken } from "@angular/core";
import { CustomFormat } from "../../models/custom-format";

export const EDITOR_CUSTOM_FORMAT_OPTIONS_TOKEN = new InjectionToken<CustomFormat[]>("custom-format-options-token");
