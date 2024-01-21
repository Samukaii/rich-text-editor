import {
	AfterViewInit,
	Component,
	inject,
	Injector,
	input,
	OnInit,
	QueryList,
	Type,
	ViewChildren,
	ViewContainerRef
} from '@angular/core';
import { MatRippleModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { ActiveFormatsService } from "../services/active-formats.service";
import { JsonPipe, NgTemplateOutlet } from "@angular/common";
import { CallPipe } from "../../../pipes/call.pipe";
import { ColorPaletteComponent } from "../../color-palette/color-palette.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import {
	TextEditorOverlayActionDirective
} from "../app-text-editor-overlay-action/text-editor-overlay-action.directive";
import { TextEditorSelectActionComponent } from "./actions/select/text-editor-select-action.component";
import { TextEditorButtonActionComponent } from "./actions/button/text-editor-button-action.component";
import { TextEditorPaletteActionComponent } from "./actions/palette/text-editor-palette-action.component";
import { EditorToolbarButton } from "../models/define-custom-toolbar-buttons";
import { TOOLBAR_BUTTON_OPTIONS_TOKEN } from "../di/tokens/toolbar-button-options.token";
import { TextEditorComponent } from "../text-editor.component";
import { EditorFormatName } from "../models/editor-format-name";
import { injectToolbarButtonsConfig } from "../di/functions/inject-toolbar-buttons-config";

@Component({
	selector: 'app-text-editor-toolbar',
	standalone: true,
	imports: [
		MatRippleModule,
		MatButtonModule,
		MatIconModule,
		MatSelectModule,
		JsonPipe,
		CallPipe,
		ColorPaletteComponent,
		MatTooltipModule,
		TextEditorOverlayActionDirective,
		TextEditorSelectActionComponent,
		TextEditorButtonActionComponent,
		TextEditorPaletteActionComponent,
		NgTemplateOutlet
	],
	templateUrl: './text-editor-toolbar.component.html',
	styleUrl: './text-editor-toolbar.component.scss'
})
export class TextEditorToolbarComponent implements OnInit, AfterViewInit {
	allToolbarButtons = injectToolbarButtonsConfig();
	activeFormatsService = inject(ActiveFormatsService);
	@ViewChildren('buttonAnchor', {read: ViewContainerRef}) anchors!: QueryList<ViewContainerRef>;

	textEditor = inject(TextEditorComponent);

	formats = input.required<EditorToolbarButton[]>();

	ngOnInit() {
		this.activeFormatsService.watchActiveFormats();
	}

	ngAfterViewInit() {
		this.anchors.forEach(anchor => {
			this.createComponentByButton(anchor);
		});
	}

	protected createComponentByButton(anchor: ViewContainerRef) {
		const formatName = this.getElementFormat(anchor.element.nativeElement);
		const options = this.formats().find(format => format.name === formatName)?.options;

		if(!this.nameExistsInToolbarConfig(formatName))
			throw new Error(`Nenhum componente para a formatação "${formatName}" foi definido`);

		const {component, options: defaultOptions} = this.allToolbarButtons[formatName];

		const injector = Injector.create({
			providers: [
				{
					provide: TOOLBAR_BUTTON_OPTIONS_TOKEN,
					useValue: {
						name: formatName,
						options: options || defaultOptions,
						editorElement: this.textEditor.editor
					}
				}
			]
		});

		const componentRef = anchor.createComponent(component as Type<any>, {injector});

		const allOptions = {
			...(defaultOptions || {}),
			...(options || {})
		};

		Object.entries(allOptions).forEach(([key, value]) => {
			const defaultUse = defaultOptions as any;
			const valueUse = value || defaultUse[key];

			if(!!valueUse) componentRef.setInput(key, value);
		});

		componentRef.changeDetectorRef.detectChanges();
	}

	private getElementFormat(element: HTMLElement) {
		const formatName = element.getAttribute('data-format-name');

		return formatName as EditorFormatName;
	}

	private nameExistsInToolbarConfig(name: string): name is keyof typeof this.allToolbarButtons{
		return name in this.allToolbarButtons;
	}
}
