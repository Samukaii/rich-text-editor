import { inject, Injectable, Signal, WritableSignal } from '@angular/core';
import { ElementRectHelper } from "../text-editor/helpers/element-rect-helper";
import { ImageEditingAlignment } from "./models/image-editing.alignment";
import { ResizerHandlerLocation } from "../../services/element-resizer/models/resizer-handler-location";
import { DOCUMENT } from "@angular/common";
import { FormatHelperService } from "../text-editor/services/format-helper.service";
import { OverlayCreatorOptions } from "../../services/overlay-creator/models/overlay-creator-options";
import { EditingToolbarComponent } from "./toolbar/editing-toolbar.component";
import { OverlayCreatorService } from "../../services/overlay-creator/overlay-creator.service";
import { EditingToolbarButton } from "./models/editing-toolbar-button";
import { ImageEditingToolbarOptions } from "./models/image-editing-toolbar.options";

@Injectable({
  providedIn: 'root'
})
export class ImageEditingToolsHelperService {
	private document = inject(DOCUMENT);
	private elementHighlight?: HTMLElement;
	private editor = inject(FormatHelperService);
	private overlayCreator = inject(OverlayCreatorService);

	createToolbar(image: HTMLElement, actions: Signal<EditingToolbarButton[]>) {
		return this.overlayCreator.open({
			anchor: image,
			component: EditingToolbarComponent,
			marginY: 30,
			data: {actions}
		});
	}

	getToolbarActions(toolbarOptions: WritableSignal<ImageEditingToolbarOptions>, imageBlock: HTMLElement) {
		return [
			{
				tooltip: "Alinhar imagem à esquerda",
				icon: "format_align_left",
				active: toolbarOptions().align === "left",
				click: () => {
					toolbarOptions.update(options => ({
						...options,
						align: "left"
					}));
				},
			},
			{
				tooltip: "Alinhar imagem ao centro",
				icon: "format_align_center",
				active: toolbarOptions().align === "center",
				click: () => {
					toolbarOptions.update(options => ({
						...options,
						align: "center"
					}));
				}
			},
			{
				tooltip: "Alinhar imagem à direita",
				active: toolbarOptions().align === "right",
				icon: "format_align_right",
				click: () => {
					toolbarOptions.update(options => ({
						...options,
						align: "right"
					}));
				},
			},
			{
				tooltip: "Remover",
				icon: "delete",
				click: () => {
					imageBlock?.remove();
				}
			},
			{
				tooltip: "Manter proporção da imagem",
				icon: "aspect_ratio",
				active: toolbarOptions().keepAspectRatio,
				click: () => {
					toolbarOptions.update(options => ({
						...options,
						keepAspectRatio: !options.keepAspectRatio
					}));
				}
			}
		]
	}

	highlightImage(image: HTMLElement) {
		let rects = ElementRectHelper.calculateScroll(image.getBoundingClientRect());
		rects = ElementRectHelper.addMarginInRect(rects, 2)

		if (!this.elementHighlight) {
			this.elementHighlight = this.document.createElement("div");
			this.document.body.appendChild(this.elementHighlight);
			this.elementHighlight.className = "element-highlight";
		}

		this.elementHighlight.classList.remove("hidden");
		this.elementHighlight.style.top = `${rects.top}px`;
		this.elementHighlight.style.left = `${rects.left}px`;
		this.elementHighlight.style.width = `${rects.width}px`;
		this.elementHighlight.style.height = `${rects.height}px`;
	}

	hasClickedInToolbar(event: MouseEvent, toolbar: OverlayCreatorOptions<EditingToolbarComponent>) {
		const target = event.target as HTMLElement;

		const overlayElement = toolbar.overlayRef.overlayElement;

		return overlayElement.contains(target);
	}

	hasClickedInSomeImageBlock(event: MouseEvent) {
		const target = event.target as HTMLElement;

		return this.editor.findFormatOnParent(target, "image");
	}

	removeElementHighlight() {
		this.elementHighlight?.classList.add("hidden");
	}

	hasClickedInBlockImageArea(event: MouseEvent, imageBlock: HTMLElement) {
		const blockRect = imageBlock.getBoundingClientRect();
		const margin = 15;

		if (!blockRect) return false;

		const imageBlockRect = ElementRectHelper.addMarginInRect(blockRect, margin);

		return ElementRectHelper.isInsideRect(event, imageBlockRect);
	}
	getActiveHandlersByAlignment(alignment: ImageEditingAlignment): ResizerHandlerLocation[] {
		switch (alignment) {
			case "left":
				return [
					"bottom",
					"right",
					"right-bottom"
				];
			case "center":
				return [
					"bottom",
					"right",
					"left",
					"left-bottom",
					"right-bottom",
				]
			case "right":
				return [
					"bottom",
					"left",
					"left-bottom"
				];
		}
	}
}
