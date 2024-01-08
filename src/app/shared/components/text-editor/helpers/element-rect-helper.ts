import { RectLimitation } from "../../../models/rect-limitation";

export class ElementRectHelper {
	private static rectDebugElement?: HTMLElement;

	static isInsideRect(coordinates: { x: number, y: number }, rect: DOMRect) {
		const {x, y} = coordinates;

		const xIsInside = x >= rect.left && x <= rect.right;
		const yIsInside = y >= rect.top && y <= rect.bottom;

		return xIsInside && yIsInside;
	}

	static debug(rect: DOMRect) {
		this.rectDebugElement?.remove();

		this.rectDebugElement = document.createElement("div");
		this.rectDebugElement.style.border = "solid 1px red";
		this.rectDebugElement.style.boxSizing = "border-box";

		this.rectDebugElement.style.position = "absolute";

		this.rectDebugElement.style.top = `${rect.top}px`;
		this.rectDebugElement.style.left = `${rect.left}px`;
		this.rectDebugElement.style.width = `${rect.width}px`;
		this.rectDebugElement.style.height = `${rect.height}px`;
		this.rectDebugElement.style.pointerEvents = "none";

		document.body.appendChild(this.rectDebugElement);
	}

	static getRectInsidePadding(element: HTMLElement) {
		const props = getComputedStyle(element);
		const rect = element.getBoundingClientRect();

		const paddingLeft = +props.paddingLeft.replace("px", "");
		const paddingRight = +props.paddingRight.replace("px", "");
		const paddingTop = +props.paddingTop.replace("px", "");
		const paddingBottom = +props.paddingBottom.replace("px", "");

		const borderLeft = +props.borderLeftWidth.replace("px", "");
		const borderRight = +props.borderRightWidth.replace("px", "");
		const borderTop = +props.borderTopWidth.replace("px", "");
		const borderBottom = +props.borderBottomWidth.replace("px", "");

		const x = rect.x + paddingLeft + borderLeft;
		const width = rect.width - (paddingRight * 2) - (borderRight * 2);

		const y = rect.y + paddingTop + borderTop;
		const height = rect.height - (paddingBottom * 2) - (borderBottom * 2);

		return this.calculateScroll(new DOMRect(x, y, width, height));
	}

	static calculateScroll(rect: DOMRect) {
		const x = rect.x + this.scrollBarLeft();
		const y = rect.y + this.scrollBarTop();

		return new DOMRect(x, y, rect.width, rect.height);
	}

	static getAspectRatio(rect: DOMRect) {
		return rect.width / rect.height;
	}

	static applyLimitations(rect: DOMRect, limitation: RectLimitation) {
		let left = rect.left;
		let right = rect.right;
		let top = rect.top;
		let bottom = rect.bottom;

		if(limitation.left && left < limitation.left)
			left = limitation.left;

		if(limitation.right && right > limitation.right)
			right = limitation.right;

		if(limitation.top && top < limitation.top)
			top = limitation.top;

		if(limitation.bottom && bottom > limitation.bottom)
			bottom = limitation.bottom;

		return new DOMRect(
			left,
			top,
			right - left,
			bottom - top
		);
	}

	private static scrollBarLeft() {
		return window.scrollX;
	}

	private static scrollBarTop() {
		return window.scrollY;
	}


	static addMarginInRect(rect: DOMRect, margin: number) {
		return new DOMRect(
			rect.x - margin,
			rect.y - margin,
			rect.width + margin * 2,
			rect.height + margin * 2
		);
	}

	static updateWidthAndKeepAspectRatio(rect: DOMRect, newWidth: number, ratio: number) {
		const newHeight = newWidth / ratio;

		return new DOMRect(rect.x, rect.y, newWidth, newHeight);
	}

	static exceedsLimitation(rect: DOMRect, limitation: RectLimitation) {
		const exceedsLeft = limitation.left && rect.left < limitation.left;
		const exceedsRight = limitation.right && rect.right > limitation.right;
		const exceedsTop = limitation.top && rect.top < limitation.top;
		const exceedsBottom = limitation.bottom && rect.bottom > limitation.bottom

		return exceedsLeft || exceedsRight || exceedsTop || exceedsBottom;
	}

	static updateHeightAndKeepAspectRatio(rect: DOMRect, newHeight: number, ratio: number) {
		const newWidth = newHeight * ratio;

		return new DOMRect(rect.x, rect.y, newWidth, newHeight);
	}
}
