import { GroupedFormatName } from "./grouped-format-name";
import { FormatName } from "./format.name";

type AllFormatOptions = [
	{
		type: "button",
		tooltip: string;
		name: FormatName,
		icon: string
	},
	{
		type: "palette",
		tooltip: string;
		icon: string;
		options: {
			tooltip: string;
			name: GroupedFormatName
		}[]
	},
	{
		type: "select",
		label: string;
		options: {
			label: string;
			name: GroupedFormatName
		}[]
	},
];

export type FormatOption<Index extends number = number> = AllFormatOptions[Index];
