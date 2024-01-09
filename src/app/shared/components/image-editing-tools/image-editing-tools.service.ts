import { computed, effect, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { EditingToolbarComponent } from "./toolbar/editing-toolbar.component";
import { OverlayCreatorOptions } from "../../services/overlay-creator/models/overlay-creator-options";
import { ElementResizerService } from "../../services/element-resizer/element-resizer.service";
import { FormatHelperService } from "../text-editor/services/format-helper/format-helper.service";
import { EditorEventsService } from "../text-editor/services/editor-events.service";
import { EditingToolbarButton } from "./models/editing-toolbar-button";
import { ImageEditingToolbarOptions } from "./models/image-editing-toolbar.options";
import { ImageEditingToolsHelperService } from "./image-editing-tools-helper.service";
import { RectLimitation } from "../../models/rect-limitation";


@Injectable()
export class ImageEditingToolsService implements OnDestroy {
	private document = inject(DOCUMENT);
	private resizer = inject(ElementResizerService);
	private editor = inject(FormatHelperService);
	private editorEvents = inject(EditorEventsService);
	private helper = inject(ImageEditingToolsHelperService);

	private currentToolbar?: OverlayCreatorOptions<EditingToolbarComponent>;
	private rectLimitation?: RectLimitation;

	private currentImageBlock = signal<HTMLElement | null>(null);
	private toolbarOptions = signal<ImageEditingToolbarOptions>({
		align: "left",
		keepAspectRatio: false
	});

	private imageElement = computed(() => {
		const block = this.currentImageBlock();

		if (!block) return;

		return this.document.querySelector( "img") as HTMLImageElement;
	});
	private alignmentElement = computed(() => {
		const block = this.currentImageBlock();

		if (!block) return;

		return this.editor.findFormatOnChildren(block, "align");
	});
	private toolbarActions = computed<EditingToolbarButton[]>(() => {
		const currentBlock = this.currentImageBlock();
		const currentAlignmentElement = this.alignmentElement();

		if (!currentAlignmentElement || !currentBlock) return [];

		return this.helper.getToolbarActions(this.toolbarOptions, currentBlock);
	});

	private updateEditingToolsOnResize = effect(() => {
		const imageSize = this.resizer.newElementSize();

		if (imageSize) this.updateEditingTools();
	});

	private closeEditingToolsOnBlockRemove = effect(() => {
		const imageBlock = this.currentImageBlock();

		if (!imageBlock) return;
		const existsOnEditor = this.editorEvents.existsOnEditor(imageBlock);

		if (!existsOnEditor()) this.closeEditingTools();
	})

	private openOrCloseEditingTools = effect(() => {
		const imageBlock = this.currentImageBlock();

		if (imageBlock) this.openEditingTools();
		else this.closeEditingTools();
	});

	private updateAlignmentElement = effect(() => {
		const currentAlignmentElement = this.alignmentElement();

		if (!currentAlignmentElement) return;

		const options = this.toolbarOptions();

		this.editor.changeElementOptions(currentAlignmentElement, {
			alignment: options.align
		});

		this.updateEditingTools();
	});

	private updateResizerOnToolbarOptionsChange = effect(() => {
		const options = this.toolbarOptions();

		this.resizer.updateConfig({
			keepAspectRatio: options.keepAspectRatio,
			activeHandlers: this.helper.getActiveHandlersByAlignment(options.align)
		});

		this.resizer.updateAllHandlerPositions();
	});

	constructor() {
		this.document.addEventListener("mousedown", this.changeImageBlockOnClick);
	}

	setResizeLimitation(rectLimitation: RectLimitation) {
		this.rectLimitation = rectLimitation;
	}

	ngOnDestroy() {
		this.document.removeEventListener("mousedown", this.changeImageBlockOnClick);
	}

	private openResizerTool() {
		const image = this.imageElement();
		const currentAlignment = this.alignmentElement();

		if (!image || !currentAlignment) return;

		this.resizer.startResize({
			elementToResize: image,
			aspectRatio: image.naturalWidth / image.naturalHeight,
			activeHandlers: this.helper.getActiveHandlersByAlignment("left"),
			rectLimitation: this.rectLimitation
		});

		this.resizer.updateAllHandlerPositions();
	}

	private openToolbar() {
		const image = this.imageElement();

		if (!image) return;

		this.currentToolbar?.close();

		this.currentToolbar = this.helper.createToolbar(image, this.toolbarActions);
	}

	private changeImageBlockOnClick = (event: MouseEvent) => {
		const imageBlockClicked = this.helper.hasClickedInSomeImageBlock(event);
		const currentBlock = this.currentImageBlock();
		const isSameImageBlock = imageBlockClicked == currentBlock;
		const didClickOnImageBlockArea = this.didClickOnImageBlockArea(event);

		if (imageBlockClicked && !isSameImageBlock) {
			this.currentImageBlock.set(imageBlockClicked);
			this.setDefaultToolbarOptions();
		}
		else if (!didClickOnImageBlockArea) this.currentImageBlock.set(null);
	}

	private didClickOnImageBlockArea(event: MouseEvent) {
		const imageBlock = this.currentImageBlock();

		if(!imageBlock || !this.currentToolbar) return false;

		return this.helper.hasClickedInToolbar(event, this.currentToolbar)
			|| this.helper.hasClickedInBlockImageArea(event, imageBlock);
	}

	private closeEditingTools() {
		this.resizer.closeResize();
		this.helper.removeElementHighlight();
		this.currentToolbar?.close();
		delete this.currentToolbar;
	}

	private openEditingTools() {
		const image = this.imageElement();
		if(!image) return;

		this.helper.highlightImage(image);
		this.openResizerTool();
		this.openToolbar();
	}

	private updateEditingTools() {
		const image = this.imageElement();
		if (!image) return;

		this.currentToolbar?.overlayRef.updatePosition();
		this.helper.highlightImage(image);
		this.resizer.updateAllHandlerPositions();
	}

	private setDefaultToolbarOptions() {
		const alignmentElement = this.alignmentElement();

		if(!alignmentElement) return;

		const options = this.editor.getNodeFormatOptions(alignmentElement);

		this.toolbarOptions.set({
			align: options.alignment,
			keepAspectRatio: false
		});
	}
}
