export const waitImageLoad = (image: HTMLImageElement) => {
	return new Promise((resolve, reject) => {
		image.onload = () => {
			resolve(image);
		}
		image.onerror = (event) => {
			reject(event)
		}
	});
}
