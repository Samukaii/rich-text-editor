import { inject, Injectable } from '@angular/core';
import { Overlay, OverlayRef, PositionStrategy } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { ColorPaletteComponent } from "./color-palette.component";

@Injectable({
	providedIn: 'root'
})
export class ColorPaletteOverlayService {
	overlay = inject(Overlay);
	popover?: OverlayRef;
	componentInstance?: ColorPaletteComponent;

	open(element: HTMLElement) {
		this.closeAll();

		this.popover = this.overlay.create({
			hasBackdrop: false,
			disposeOnNavigation: true,
			positionStrategy: this.getOverlayPosition(element),
			scrollStrategy: this.overlay.scrollStrategies.close()
		});

		this.componentInstance = this.popover.attach(
			new ComponentPortal(ColorPaletteComponent)
		).instance;

		return this.popover;
	}

	closeAll() {
		this.popover?.dispose();
	}

	private getOverlayPosition(origin: HTMLElement): PositionStrategy {
		return this.overlay
			.position()
			.flexibleConnectedTo(origin)
			.withPositions([
				{
					originX: 'start',
					originY: 'top',
					overlayX: 'start',
					overlayY: 'bottom',
				},
				{
					originX: 'start',
					originY: 'bottom',
					overlayX: 'start',
					overlayY: 'top',
				},
				{
					originX: 'end',
					originY: 'top',
					overlayX: 'end',
					overlayY: 'bottom',
				},
			]);
	}
}
