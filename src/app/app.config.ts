import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideCustomFormatOptions } from "./shared/components/text-editor/di/providers/provide-custom-format-options";
import { autocompleteFormat, mentionFormat } from "./app.component";

export const appConfig: ApplicationConfig = {
  providers: [
	  provideRouter(routes),
	  provideClientHydration(),
	  provideAnimations(),
	  provideCustomFormatOptions([autocompleteFormat, mentionFormat])
  ]
};
