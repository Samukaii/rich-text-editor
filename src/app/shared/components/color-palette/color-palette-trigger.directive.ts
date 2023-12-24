import {
	ChangeDetectorRef,
	Directive,
	ElementRef,
	EventEmitter,
	HostListener,
	inject,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges
} from '@angular/core';
import { OverlayRef } from "@angular/cdk/overlay";
import { filter, Subscription, take } from "rxjs";
import { ColorPaletteOverlayService } from "./color-palette-overlay.service";
import { ColorPaletteComponent } from "./color-palette.component";
import { FormatOption } from "../../models/format-option";
import { GroupedFormatName } from "../../models/grouped-format-name";

@Directive({
	selector: '[appColorPaletteTrigger]',
	providers: [ColorPaletteOverlayService],
	standalone: true
})
export class ColorPaletteTriggerDirective implements OnDestroy, OnChanges {
	overlay = inject(ColorPaletteOverlayService);
	elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
	changeDetector = inject(ChangeDetectorRef);

	@Output() colorClick = new EventEmitter<GroupedFormatName>();
	@Input() parentElement?: HTMLElement;

	@Input({required: true}) colors!: FormatOption<1>["options"];
	@Input() selected?: GroupedFormatName;

	private overlayRef?: OverlayRef;
	private clickSubscription?: Subscription;
	private componentInstance?: ColorPaletteComponent;

	@HostListener("click")
	clickIn() {
		if (!this.overlayRef?.hasAttached()) this.open();
		else this.close();
	}

	open() {
		this.overlayRef = this.overlay.open(this.parentElement ?? this.elementRef.nativeElement);
		this.watchClose(this.overlayRef);
		this.componentInstance = this.overlay.componentInstance;
		this.updateProperties();

		this.watchClick();
	}

	watchClose(overlayRef: OverlayRef) {
		overlayRef.outsidePointerEvents().pipe(
			filter(event => !this.hasClickedAtThisElement(event)),
			take(1)
		).subscribe(() => this.close());
	}

	watchClick() {
		this.clickSubscription?.unsubscribe();
		this.clickSubscription = this.componentInstance?.colorClick.subscribe(formatName => {
				this.colorClick.emit(formatName);
				//this.close();
			}
		);
	}

	close() {
		this.overlay.closeAll();
	}

	ngOnDestroy() {
		this.clickSubscription?.unsubscribe();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['colors'] || changes['selected'])
			this.updateProperties();
	}

	private updateProperties() {
		if (!this.componentInstance) return;

		this.componentInstance.colors = this.colors;
		this.componentInstance.selected = this.selected;


		this.changeDetector.detectChanges();
	}

	private hasClickedAtThisElement(event: MouseEvent) {
		return this.elementRef.nativeElement.contains(event.target as HTMLElement)
	}
}
