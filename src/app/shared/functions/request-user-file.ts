export const requestUserFile = () => {
	const input = document.createElement("input");
	input.type = "file";
	input.click();

	return new Promise<File[]>((resolve) => {
		const onChange = () => {
			resolve(Array.from(input.files ?? []));
			document.body.removeEventListener('focusin', onChange);
			input.removeEventListener('change', onChange);
		};

		input.addEventListener('change', onChange);
		document.body.addEventListener('focusin', onChange);
	})
}
