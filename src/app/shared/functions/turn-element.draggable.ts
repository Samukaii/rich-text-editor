import { ElementDraggableConfig } from "../components/text-editor/models/element-draggable-config";

export const turnElementDraggable = (config: ElementDraggableConfig) => {
	const {element, document} = config;
	const {rectLimitation} = config;

	let originalWidth = 0;
	let originalHeight = 0;

	element.addEventListener('mousedown', event => {
		event.preventDefault();

		originalWidth = event.clientX;
		originalHeight = event.clientY;

		const onMouseUp = () => {
			document.removeEventListener('mouseup', onMouseUp);
			document.removeEventListener('mousemove', onDrag);
		}

		document.addEventListener('mousemove', onDrag);
		document.addEventListener('mouseup', onMouseUp);
	});

	const onDrag = (event: MouseEvent) => {
		event.preventDefault();

		let deltaX = originalWidth - event.clientX;

		originalWidth = event.clientX;

		let newXPosition = (element.offsetLeft - deltaX);

		if (rectLimitation?.right && newXPosition > rectLimitation.right)
			newXPosition = rectLimitation.right;

		if (rectLimitation?.left && newXPosition < rectLimitation.left)
			newXPosition = rectLimitation.left;

		let deltaY = originalHeight - event.clientY;

		originalHeight = event.clientY;

		let newYPosition = element.offsetTop - deltaY;

		if (rectLimitation?.top && newYPosition < rectLimitation.top)
			newYPosition = rectLimitation.top;

		// if (rectLimitation?.bottom && newYPosition > rectLimitation.bottom)
		// 	newYPosition = rectLimitation.bottom;

		const options = config.options?.() || {};

		if (options.disabled) return;

		if(options.lockAxis !== "X")
		element.style.left = newXPosition + "px";

		if(options.lockAxis !== "Y")
		element.style.top = newYPosition + "px";

		config.onDrag?.();
	};
}
