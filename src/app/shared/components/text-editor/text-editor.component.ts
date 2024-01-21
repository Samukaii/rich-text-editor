import { AfterViewInit, Component, DestroyRef, ElementRef, inject, input, PLATFORM_ID, ViewChild } from '@angular/core';
import { MatRippleModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TextEditorToolbarComponent } from "./toolbar/text-editor-toolbar.component";
import { EditorEventsService } from "./services/editor-events.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ImageEditingToolsService } from "../image-editing-tools/image-editing-tools.service";
import { isPlatformBrowser } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ElementRectHelper } from "./helpers/element-rect-helper";
import { EditorToolbarButton } from "./models/define-custom-toolbar-buttons";

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
	editorEvents = inject(EditorEventsService);
	imageEditing = inject(ImageEditingToolsService);
	@ViewChild('editor') editorRef!: ElementRef<HTMLElement>;

	private platformId = inject(PLATFORM_ID);
	private destroyRef = inject(DestroyRef);

	formats = input<EditorToolbarButton[]>([]);


	get editor() {
		return this.editorRef.nativeElement;
	}

	ngAfterViewInit() {
		if (!isPlatformBrowser(this.platformId)) return;

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
}
