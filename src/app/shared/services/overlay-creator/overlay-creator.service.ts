import { inject, Injectable, Injector, input } from '@angular/core';
import { ComponentType, Overlay, PositionStrategy } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { OverlayCreatorOptions } from "./models/overlay-creator-options";
import { OVERLAY_DATA_TOKEN } from "./overlay-data.token";
import { OverlayConfig } from "./models/overlay-config";

@Injectable({
  providedIn: 'root'
})
export class OverlayCreatorService {
	private overlay = inject(Overlay);

	open<T extends ComponentType<any>>(config: OverlayConfig<T>): OverlayCreatorOptions<InstanceType<T>> {
		const popover = this.overlay.create({
			hasBackdrop: false,
			disposeOnNavigation: true,
			positionStrategy: this.getOverlayPosition(config.anchor, config),
			scrollStrategy: this.overlay.scrollStrategies.reposition()
		});

		const componentRef = popover.attach(new ComponentPortal(config.component));

		Object.entries(config.inputs || {}).forEach(([key, value]) => {
			componentRef.setInput(key, value);
		});

		componentRef.changeDetectorRef.detectChanges();

		return {
			overlayRef: popover,
			instance: componentRef.instance,
			close: () => popover.dispose()
		};
	}

	private getOverlayPosition(origin: HTMLElement, config: OverlayConfig<ComponentType<any>>): PositionStrategy {
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
