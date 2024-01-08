
export type DragLockAxis = "X" | "Y";

export interface ElementDraggableConfig {
	document: Document;
	element: HTMLElement;
	rectLimitation?: {
		right?: number;
		left?: number;
		top?: number;
		bottom?: number;
	};
	options?: () => {
		disabled?: boolean;
		lockAxis?: DragLockAxis;
	}
	onDrag?: () => void;
}
