import { ResizerHandlerLocation } from "./resizer-handler-location";

export interface ResizerHandler {
	location: ResizerHandlerLocation;
	element: HTMLElement;
	hidden: boolean;
}
