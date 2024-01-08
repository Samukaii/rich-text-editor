import { OverlayRef } from "@angular/cdk/overlay";

export interface OverlayCreatorOptions<T> {
	overlayRef: OverlayRef;
	instance: T,
	close: () => void;
}
