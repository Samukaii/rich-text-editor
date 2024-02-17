import { OverlayRef } from "@angular/cdk/overlay";
import { ComponentRef } from "@angular/core";

export interface OverlayCreatorOptions<T> {
	overlayRef: OverlayRef;
	ref: ComponentRef<T>;
	instance: T,
	close: () => void;
}
