import {
	AfterViewInit,
	Component,
	DestroyRef,
	effect,
	ElementRef,
	inject,
	input,
	PLATFORM_ID,
	ViewChild
} from '@angular/core';
import { MatRippleModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TextEditorToolbarComponent } from "./toolbar/text-editor-toolbar.component";
import { EditorEventsService } from "./services/editor-events.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ImageEditingToolsService } from "../image-editing-tools/image-editing-tools.service";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ElementRectHelper } from "./helpers/element-rect-helper";
import { EditorToolbarButton } from "./models/define-custom-toolbar-buttons";
import { EditorRegexFormatService } from "./editor-regex-format.service";
import { EditorMatchRule } from "./models/editor-match-rule";
import { TextSegmentControllerService } from "./text-segment-controller.service";
import { TextFormatterService } from "./services/text-formatter.service";
import { isPlatformBrowser, JsonPipe } from "@angular/common";
import { ActiveFormatsService } from "./services/active-formats.service";

@Component({
	selector: 'app-text-editor',
	standalone: true,
	imports: [
		MatRippleModule,
		MatButtonModule,
		MatIconModule,
		TextEditorToolbarComponent,
		MatTooltipModule,
		JsonPipe,
	],
	templateUrl: './text-editor.component.html',
	styleUrl: './text-editor.component.scss',
	providers: [
		ActiveFormatsService,
		EditorRegexFormatService,
		TextSegmentControllerService,
		ImageEditingToolsService,
		TextFormatterService,
	]
})
export class TextEditorComponent implements AfterViewInit {
	private editorEvents = inject(EditorEventsService);
	private imageEditing = inject(ImageEditingToolsService);
	private regex = inject(EditorRegexFormatService);
	private destroyRef = inject(DestroyRef);
	protected segmentsController = inject(TextSegmentControllerService);
	private platform = inject(PLATFORM_ID);
	@ViewChild('editor') editorRef!: ElementRef<HTMLElement>;

	formats = input.required<EditorToolbarButton[]>();
	regexRules = input<EditorMatchRule[]>([]);

	private setRegexRules = effect(() => {
		this.regex.setRegexRules(this.editor, this.regexRules());
	});

	get editor() {
		return this.editorRef.nativeElement;
	}

	ngAfterViewInit(): void {
		if(!isPlatformBrowser(this.platform)) return;
		this.setControllerEditor();
		this.watchEditorChanges();
		this.setImageResizing();
	}

	private setControllerEditor() {
		this.segmentsController.setElement(this.editor);
	}

	private setImageResizing() {
		const editorLimits = ElementRectHelper.getRectInsidePadding(this.editor);

		this.imageEditing.setResizeLimitation({
			right: editorLimits.right,
			left: editorLimits.left,
			top: editorLimits.top,
		});
	}

	private watchEditorChanges() {
		this.editorEvents.watchEditorChanges$(this.editor).pipe(
			takeUntilDestroyed(this.destroyRef)
		).subscribe();
	}
}
