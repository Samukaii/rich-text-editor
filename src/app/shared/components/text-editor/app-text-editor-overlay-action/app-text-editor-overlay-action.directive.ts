import { Directive, ElementRef, HostListener, inject, Input, OnDestroy, Type } from '@angular/core';
import { Generic } from "../models/generic";
import { OverlayCreatorService } from "../../../services/overlay-creator/overlay-creator.service";
import { OverlayCreatorOptions } from "../../../services/overlay-creator/models/overlay-creator-options";
import { filter, Subscription, take } from "rxjs";
import { OverlayRef } from "@angular/cdk/overlay";

@Directive({
  selector: '[appTextEditorOverlayAction]',
  standalone: true,
})
export class AppTextEditorOverlayActionDirective implements OnDestroy {
	@Input({required: true}) component!: Type<any>;
	@Input() options: Generic = {};

	overlayCreator = inject(OverlayCreatorService);
	elementRef = inject(ElementRef);

	private currentOverlay?: OverlayCreatorOptions<any>;

	private clickSubscription?: Subscription;
	private overlayOptions?: OverlayCreatorOptions<any>;

	@HostListener("click")
	clickIn() {
		if (!this.currentOverlay?.overlayRef?.hasAttached()) this.open();
		else this.close();
	}

	open() {
		this.close();

		this.overlayOptions = this.overlayCreator.open({
			anchor: this.elementRef.nativeElement,
			component: this.component,
			data: {
				options: this.options
			}
		});

		this.watchClose(this.overlayOptions.overlayRef);

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
	}

	close() {
		this.overlayOptions?.close();
	}

	ngOnDestroy() {
		this.clickSubscription?.unsubscribe();
	}

	private hasClickedAtThisElement(event: MouseEvent) {
		return this.elementRef.nativeElement.contains(event.target as HTMLElement)
	}
}
