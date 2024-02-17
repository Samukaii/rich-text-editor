import { Generic } from "../components/text-editor/models/generic";

export const deepCompareObjects = (first: Generic, second: Generic, depth = 1): boolean => {
	const firstEntries = Object.entries(first);
	const secondEntries = Object.entries(second);

	if (firstEntries === secondEntries) return true;
	if (firstEntries.length !== secondEntries.length) return false;

	if (depth === 0) return false;

	return firstEntries.every(([key, value]) => {
		if (typeof value !== second[key]) return false;
		if (typeof value !== "object") return value === second[key];

		return deepCompareObjects(value, second[key], depth - 1);
	})
}
