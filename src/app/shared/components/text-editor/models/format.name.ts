import { allTextFormats } from "../static/all-text-formats";
import { allTextBlocks } from "../static/all-text-blocks";

export type FormatName = typeof allTextFormats[number]["name"];
export type FormatBlockName = typeof allTextBlocks[number]["name"];
