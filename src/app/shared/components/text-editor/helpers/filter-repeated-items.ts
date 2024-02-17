export const filterRepeatedItems = <T>(items: T[]) => items
	.filter((value, index, array) => array.indexOf(value) === index);
