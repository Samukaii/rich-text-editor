export const createFileUrl = (file: File) => {
	const url = window.URL || window.webkitURL;

	return url.createObjectURL(file);
}
