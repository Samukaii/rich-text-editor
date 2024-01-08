import { inject, Injectable, Injector } from '@angular/core';
import { Overlay, PositionStrategy } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { OverlayCreatorOptions } from "./models/overlay-creator-options";
import { OVERLAY_DATA_TOKEN } from "./overlay-data.token";
import { OverlayConfig } from "./models/overlay-config";

@Injectable({
  providedIn: 'root'
})
export class OverlayCreatorService {
	private overlay = inject(Overlay);

	open<T>(config: OverlayConfig<T>): OverlayCreatorOptions<T> {
		const popover = this.overlay.create({
			hasBackdrop: false,
			disposeOnNavigation: true,
			positionStrategy: this.getOverlayPosition(config.anchor, config),
			scrollStrategy: this.overlay.scrollStrategies.reposition()
		});

		const injector = Injector.create({
			providers: [
				{
					provide: OVERLAY_DATA_TOKEN,
					useValue: config.data || {}
				}
			]
		})

		const componentInstance = popover.attach(
			new ComponentPortal(config.component, null, injector)
		).instance;

		return {
			overlayRef: popover,
			instance: componentInstance,
			close: () => popover.dispose()
		};
	}

	private getOverlayPosition<T>(origin: HTMLElement, config: OverlayConfig<T>): PositionStrategy {
		return this.overlay
			.position()
			.flexibleConnectedTo(origin)
			.withPositions([
				{
					originX: 'center',
					originY: 'bottom',
					overlayX: 'center',
					overlayY: 'top',
				},
				{
					originX: 'center',
					originY: 'top',
					overlayX: 'center',
					overlayY: 'bottom',
				},
				{
					originX: 'end',
					originY: 'top',
					overlayX: 'end',
					overlayY: 'bottom',
				},
			])
			.withDefaultOffsetX(config.marginX || 0)
			.withDefaultOffsetY(config.marginY || 0);
	}
}
