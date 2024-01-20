import {
	AfterViewInit,
	Component,
	computed,
	createComponent,
	effect,
	EventEmitter,
	inject,
	input,
	Input,
	OnInit,
	Output, QueryList,
	Signal, TemplateRef, Type, ViewChildren, ViewContainerRef
} from '@angular/core';
import { MatRippleModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormatOption } from "../models/format-option";
import { MatSelectModule } from "@angular/material/select";
import { ActiveFormat, ActiveFormatsService } from "../services/active-formats.service";
import { JsonPipe, NgTemplateOutlet } from "@angular/common";
import { CallPipe } from "../../../pipes/call.pipe";
import { ColorPaletteComponent } from "../../color-palette/color-palette.component";
import { GroupedFormatName } from "../models/grouped-format-name";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormatName } from "../models/format.name";
import {
	TextEditorOverlayActionDirective
} from "../app-text-editor-overlay-action/text-editor-overlay-action.directive";
import { TextEditorSelectActionComponent } from "./actions/select/text-editor-select-action.component";
import { TextEditorButtonActionComponent } from "./actions/button/text-editor-button-action.component";
import { TextEditorOverlayActionComponent } from "./actions/overlay/text-editor-overlay-action.component";
import { EditorFormatName } from "../models/editor-format-name";
import { injectToolbarButtonsConfig } from "../../../functions/di/inject-toolbar-buttons-config";
import {
	EditorToolbarButton,
	EditorToolbarButtonsConfig
} from "../../../../components/text-editor/models/define-custom-toolbar-buttons";
import { Generic } from "../models/generic";
import { ComponentPortal, DomPortal } from "@angular/cdk/portal";

interface TextEditorToolbarInterface {
	activeFormats: Signal<ActiveFormat[]>;
}

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
		TextEditorOverlayActionComponent,
		NgTemplateOutlet
	],
	templateUrl: './text-editor-toolbar.component.html',
	styleUrl: './text-editor-toolbar.component.scss'
})
export class TextEditorToolbarComponent implements OnInit, AfterViewInit {
	allToolbarButtons = injectToolbarButtonsConfig();
	activeFormatsService = inject(ActiveFormatsService);
	containerRef = inject(ViewContainerRef);
	@ViewChildren('buttonAnchor', {read: ViewContainerRef}) anchors!: QueryList<ViewContainerRef>;

	formats = input.required<EditorToolbarButton[]>();

	ngOnInit() {
		this.activeFormatsService.watchActiveFormats();
	}

	ngAfterViewInit() {
		this.anchors.forEach(anchor => {
			const button = this.formats()?.find(format => {
				if(typeof format === "string")
					return anchor.element.nativeElement.id === format;

				return anchor.element.nativeElement.id === format.name;
			});

			if(!button) return;

			this.createComponentByButton(button);
		})
	}

	protected createComponentByButton(button: EditorToolbarButton) {
		let name: string;
		let options = {};

		if(typeof button === "string")
			name = button;
		else {
			name = button.name;
			options = button.options || {};
		}

		if(!this.nameExistsInToolbarConfig(name))
			throw new Error(`Nenhum componente para a formatação "${name}" foi definido`);

		const {component} = this.allToolbarButtons[name];


		const instance = this.containerRef.createComponent(component as Type<any>);

		Object.entries(options).forEach(([key, value]) => {
			instance.setInput(key, value);
		});

		this.anchors.find(item => item.element.nativeElement.id)

	}

	private nameExistsInToolbarConfig(name: string): name is keyof typeof this.allToolbarButtons{
		return name in this.allToolbarButtons;
	}
}
