import { AfterViewInit, Component, DestroyRef, ElementRef, inject, Input, PLATFORM_ID, ViewChild } from '@angular/core';
import { TextFormatterService } from "./services/text-formatter.service";
import { MatRippleModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormatOption } from "./models/format-option";
import { TextEditorToolbarComponent } from "./toolbar/text-editor-toolbar.component";
import { ActiveFormatsService } from "./services/active-formats.service";
import { FormatName } from "./models/format.name";
import { requestUserFile } from "../../functions/request-user-file";
import { createFileUrl } from "../../functions/create-file-url";
import { EditorEventsService } from "./services/editor-events.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ImageEditingToolsService } from "../image-editing-tools/image-editing-tools.service";
import { isPlatformBrowser } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ElementRectHelper } from "./helpers/element-rect-helper";

@Component({
	selector: 'app-text-editor',
	standalone: true,
	imports: [
		MatRippleModule,
		MatButtonModule,
		MatIconModule,
		TextEditorToolbarComponent,
		MatTooltipModule
	],
	templateUrl: './text-editor.component.html',
	styleUrl: './text-editor.component.scss',
	providers: [ImageEditingToolsService]
})
export class TextEditorComponent implements AfterViewInit {
	formatter = inject(TextFormatterService);
	activeFormats = inject(ActiveFormatsService);
	editorEvents = inject(EditorEventsService);
	imageEditing = inject(ImageEditingToolsService);
	private platformId = inject(PLATFORM_ID);
	private destroyRef = inject(DestroyRef);

	@ViewChild('editor') editorRef!: ElementRef<HTMLElement>;
	@Input() formats: FormatOption[] = [];

	get editor() {
		return this.editorRef.nativeElement;
	}

	applyFormat(actionName: FormatName) {
		if(actionName === "image") {
			this.insertImage();
			return;
		}

		if(actionName.includes(":")) {
			const [format, color] = actionName.split(":");

			if(color === "normal")
				this.formatter.applyFormat(format, {remove: true});
			if(format === "align")
				this.formatter.applyFormat(format, {alignment: color});

			else this.formatter.applyFormat(format, {color});
		}
		else this.formatter.applyFormat(actionName);

		this.formatter.normalizeElement(this.editor)

		this.activeFormats.updateActiveFormats()
	}

	ngAfterViewInit() {
		if(!isPlatformBrowser(this.platformId)) return;

		this.editorEvents.watchEditorChanges$(this.editor).pipe(
			takeUntilDestroyed(this.destroyRef)
		).subscribe();

		const editorLimits = ElementRectHelper.getRectInsidePadding(this.editor);

		this.imageEditing.setResizeLimitation({
			right: editorLimits.right,
			left: editorLimits.left,
			top: editorLimits.top,
		});
	}


	private async insertImage() {
		const files = await requestUserFile();
		const src = createFileUrl(files[0]);

		this.editor.focus();

		this.formatter.applyFormat('image', {src});
	}
}
