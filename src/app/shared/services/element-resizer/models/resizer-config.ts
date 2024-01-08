import { ResizerHandlerLocation } from "./resizer-handler-location";

import { RectLimitation } from "../../../models/rect-limitation";

export interface ResizerConfig {
	elementToResize: HTMLElement;
	activeHandlers: ResizerHandlerLocation[];
	rectLimitation?: RectLimitation;
	aspectRatio?: number;
	keepAspectRatio?: boolean;
}
