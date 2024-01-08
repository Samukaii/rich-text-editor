import { inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { turnElementDraggable } from "../../functions/turn-element.draggable";
import { ResizerHandler } from "./models/resizer-handler";
import {
	ResizerHandlerLocation
} from "./models/resizer-handler-location";
import { ElementRectHelper } from "../../components/text-editor/helpers/element-rect-helper";
import { ResizerConfig } from "./models/resizer-config";
import { ResizerHandlerDirection } from "./models/resizer-handler-direction";

@Injectable({
	providedIn: 'root'
})
export class ElementResizerService {
	newElementSize = signal<DOMRect | null>(null);
	private document = inject(DOCUMENT);
	private handlers: ResizerHandler[] = [];
	private config?: ResizerConfig;
	private originalSize?: DOMRect;
	private aspectRatio?: number;

	startResize(config: ResizerConfig) {
		this.config = config;
		this.originalSize = this.config.elementToResize.getBoundingClientRect();
		this.originalSize = ElementRectHelper.calculateScroll(this.originalSize);

		this.aspectRatio = config.aspectRatio || ElementRectHelper.getAspectRatio(this.originalSize);

		const locations: ResizerHandlerLocation[] = [
			'left',
			'right',
			'top',
			'bottom',
			'left-bottom',
			'left-top',
			'right-bottom',
			'right-top',
		]

		locations.forEach(location => this.createHandler(location));

		this.updateActiveHandlers();
	}

	closeResize() {
		this.handlers.forEach(handler => {
			handler.element.remove();
		});

		this.handlers = [];
	}

	updateConfig(config: Omit<Partial<ResizerConfig>, "elementToResize" | "rectLimitation">) {
		if(!this.config) return;

		this.config = {
			...this.config,
			...config
		};

		if(config.activeHandlers)
			this.updateActiveHandlers();

		if(config.keepAspectRatio) {
			this.updateElementToKeepAspectRatio();
			this.updateAllHandlerPositions();
		}
	}

	updateAllHandlerPositions() {
		this.handlers.forEach(handler => {
			this.updateHandlerPosition(handler.location);
			this.updateHandlerSize(handler.location);
		});
	}

	private createHandler(location: ResizerHandlerLocation) {
		const element = document.createElement("span");
		const child = document.createElement("span");

		element.className = `text-editor-resizer ${location} hidden`;

		child.className = `resizer-child ${location}`;

		element.appendChild(child);

		this.document.body.appendChild(element);

		const handler: ResizerHandler = {
			location,
			element,
			hidden: true
		};

		this.handlers.push(handler)

		this.attachDraggableBehaviour(handler);

		this.updateHandlerPosition(location);
		this.updateHandlerSize(location);
	}

	private attachDraggableBehaviour(handler: ResizerHandler) {
		const {element, location} = handler;

		turnElementDraggable({
			document: this.document,
			element,
			rectLimitation: this.config?.rectLimitation,
			options: () => ({
				lockAxis: this.handlerLockAxis(location),
				disabled: this.isDragDisabled(location)
			}),
			onDrag: () => this.onHandlerDrag(location)
		});
	}

	private handlerLockAxis(location: ResizerHandlerLocation) {
		let lockAxis: "X" | "Y" | undefined;
		const direction = this.getDirection(location);

		if(direction === "vertical")
			lockAxis = "X";
		else if(direction === "horizontal")
			lockAxis = "Y";
		else if(this.config?.keepAspectRatio)
			lockAxis = "Y";

		return lockAxis as "X" | "Y";
	}

	private resizeElementByHandler(location: ResizerHandlerLocation) {
		const elementToResize = this.config?.elementToResize;

		if(!elementToResize) return;

		elementToResize.style.minWidth = "100px";
		elementToResize.style.minHeight = "100px";

		const direction = this.getDirection(location);

		if(direction === "horizontal") {
			const {horizontal} = this.getDistanceInDirection(direction);


			if(this.config?.keepAspectRatio) {
				this.updateWidthKeepingAspectRatio(horizontal);
			}
			else {
				elementToResize.style.width = horizontal + "px";
				elementToResize.style.height = this.getElementRects().height + "px";
			}
		}

		if(direction === "vertical") {
			const {vertical} = this.getDistanceInDirection(direction);

			if(this.config?.keepAspectRatio)
				this.updateHeightKeepingAspectRatio(vertical);
			else {
				elementToResize.style.height = vertical + "px";
				elementToResize.style.width = this.getElementRects().width + "px";
			}
		}

		if(direction === "diagonal" || direction === "reverse-diagonal") {
			const {vertical, horizontal} = this.getDistanceInDirection(direction);

			if(this.config?.keepAspectRatio) {
				this.updateWidthKeepingAspectRatio(horizontal);
				const rects = this.getHandlerCoordinates(location);
				this.getHandler(location).element.style.top = `${rects.y}px`;
			}
			else {
				elementToResize.style.width = horizontal + "px";
				elementToResize.style.height = vertical + "px";
			}
		}
	}

	private updateActiveHandlers() {
		const active = this.config?.activeHandlers;
		if(!active) return;

		this.handlers = this.handlers.map(handler => {
			if(active.includes(handler.location)) {
				handler.element.classList.remove("hidden");

				return {
					...handler,
					hidden: false
				}
			}
			else {
				handler.element.classList.add("hidden");

				return {
					...handler,
					hidden: true
				}
			}
		});
	}

	private onHandlerDrag(location: ResizerHandlerLocation) {
		const currentHandler = this.getHandler(location);
		if(!currentHandler) return;

		this.resizeElementByHandler(location);

		this.handlers.forEach(handler => {
			this.updateHandlerSize(handler.location);
			if(handler.location !== location)
				this.updateHandlerPosition(handler.location)
		})

		this.newElementSize.set(this.getElementRects())
	}

	private isDragDisabled(location: ResizerHandlerLocation) {
		const handler = this.getHandler(location);

		return !!handler?.hidden;
	}

	private updateHandlerSize(handlerLocation: ResizerHandlerLocation) {
		const elementToResize = this.config?.elementToResize;

		if(!elementToResize) return;

		const elementToResizeBounds = elementToResize.getBoundingClientRect();
		const handler = this.getHandler(handlerLocation);

		if(!handler) return;

		const {element} = handler;
		const direction = this.getDirection(handlerLocation);

		if(direction === "horizontal")
			element.style.height = `${elementToResizeBounds.height}px`;
		else if(direction === "vertical")
			element.style.width = `${elementToResizeBounds.width}px`;
	}

	private getHandler(location: ResizerHandlerLocation) {
		const handler = this.handlers.find(handler => handler.location === location);

		if(!handler)
			throw new Error("Not all handlers are defined");

		return handler;
	}

	private getHandlerRect(location: ResizerHandlerLocation) {
		const handler = this.getHandler(location);

		return handler.element.getBoundingClientRect();
	}

	private updateHandlerPosition(location: ResizerHandlerLocation) {
		const handler = this.getHandler(location);

		if(!handler) return;

		const {element} = handler;
		const coordinates = this.getHandlerCoordinates(location);

		element.style.left = `${coordinates.x}px`
		element.style.top = `${coordinates.y}px`
	}

	private getHandlerCoordinates(position: ResizerHandlerLocation): {x: number; y: number} {
		let imageRect = this.getElementRects();

		switch (position) {
			case "left":
				return {
					x: imageRect.left,
					y: imageRect.top
				};
			case "right":
				return {
					x: imageRect.right,
					y: imageRect.top
				};
			case "top":
				return {
					x: imageRect.left,
					y: imageRect.top
				};
			case "bottom":
				return {
					x: imageRect.left,
					y: imageRect.bottom
				};
			case "right-top":
				return {
					x: imageRect.right,
					y: imageRect.top
				};
			case "left-top":
				return {
					x: imageRect.left,
					y: imageRect.top
				};
			case "right-bottom":
				return {
					x: imageRect.right,
					y: imageRect.bottom
				};
			case "left-bottom":
				return {
					x: imageRect.left,
					y: imageRect.bottom
				};
		}
	}

	private getElementRects() {
		const elementToResize = this.config?.elementToResize;

		if(!elementToResize)
			throw new Error("Element to resize is not defined");

		let elementRect = elementToResize.getBoundingClientRect();
		elementRect = ElementRectHelper.calculateScroll(elementRect);

		if(this.config?.rectLimitation)
			elementRect = ElementRectHelper.applyLimitations(elementRect, this.config.rectLimitation);

		return elementRect;
	}

	private getDistanceInDirection(direction: ResizerHandlerDirection) {
		const rightRect = this.getHandlerRect("right");
		const leftRect = this.getHandlerRect("left");
		const topRect = this.getHandlerRect("top");
		const bottomRect = this.getHandlerRect("bottom");

		const leftTopRect = this.getHandlerRect("left-top");
		const rightBottomRect = this.getHandlerRect("right-bottom");

		const rightTopRect = this.getHandlerRect("right-top");
		const leftBottomRect = this.getHandlerRect("left-bottom");

		let topPos = 0;
		let bottomPos = 0;

		let rightPos = 0;
		let leftPos = 0;

		if(direction === "horizontal") {
			rightPos = rightRect.left;
			leftPos = leftRect.right;
		}
		if(direction === "vertical") {
			topPos = topRect.bottom;
			bottomPos = bottomRect.top;
		}
		if(direction === "diagonal") {
			topPos = leftTopRect.top;
			bottomPos = rightBottomRect.top;

			leftPos = leftTopRect.right;
			rightPos = rightBottomRect.right;
		}
		if(direction === "reverse-diagonal") {
			topPos = rightTopRect.top;
			bottomPos = leftBottomRect.top;

			leftPos = rightTopRect.right;
			rightPos = leftBottomRect.right;
		}

		return {
			vertical: Math.abs(bottomPos - topPos),
			horizontal: Math.abs(rightPos - leftPos)
		};
	}

	private getDirection(location: ResizerHandlerLocation): ResizerHandlerDirection {
		if(location === "left" || location === "right") return "horizontal";
		if(location === "top" || location === "bottom") return  "vertical";
		if(location === "left-top" || location === "right-bottom") return "diagonal";
		else return "reverse-diagonal";
	}

	private updateElementToKeepAspectRatio() {
		const elementToResize = this.config?.elementToResize;
		const limitation = this.config?.rectLimitation;

		if(!elementToResize || !this.aspectRatio || !limitation) return;
		const currentRect = this.getElementRects();

		let newDimensions = ElementRectHelper.updateHeightAndKeepAspectRatio(
			currentRect,
			currentRect.height,
			this.aspectRatio
		);

		if(ElementRectHelper.exceedsLimitation(newDimensions, limitation))
			newDimensions = ElementRectHelper.updateWidthAndKeepAspectRatio(
				currentRect,
				currentRect.width,
				this.aspectRatio
			);

		elementToResize.style.height = `${newDimensions.height}px`;
		elementToResize.style.width = `${newDimensions.width}px`;
	}

	updateHeightKeepingAspectRatio(newHeight: number) {
		const elementToResize = this.config?.elementToResize;
		const originalRect = this.originalSize;
		const limitation = this.config?.rectLimitation;

		if(!elementToResize || !originalRect || !this.aspectRatio) return;

		let newDimensions = ElementRectHelper.updateHeightAndKeepAspectRatio(
			originalRect,
			newHeight,
			this.aspectRatio
		);

		if(limitation && ElementRectHelper.exceedsLimitation(newDimensions, limitation)) return;

		elementToResize.style.height = `${newDimensions.height}px`;
		elementToResize.style.width = `${newDimensions.width}px`;
	}

	updateWidthKeepingAspectRatio(newWidth: number) {
		const elementToResize = this.config?.elementToResize;
		const originalRect = this.originalSize;
		const limitation = this.config?.rectLimitation;

		if(!elementToResize || !originalRect || !this.aspectRatio) return;

		let newDimensions = ElementRectHelper.updateWidthAndKeepAspectRatio(
			originalRect,
			newWidth,
			this.aspectRatio
		);

		if(limitation && ElementRectHelper.exceedsLimitation(newDimensions, limitation)) return;

		elementToResize.style.height = `${newDimensions.height}px`;
		elementToResize.style.width = `${newDimensions.width}px`;
	}
}
