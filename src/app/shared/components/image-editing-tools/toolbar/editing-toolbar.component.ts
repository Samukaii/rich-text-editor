import { Component, inject, Signal } from '@angular/core';
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { OVERLAY_DATA_TOKEN } from "../../../services/overlay-creator/overlay-data.token";
import { EditingToolbarButton } from "../models/editing-toolbar-button";

@Component({
  selector: 'app-toolbar',
  standalone: true,
	imports: [
		MatTooltipModule,
		MatButtonModule,
		MatIconModule
	],
  templateUrl: './editing-toolbar.component.html',
  styleUrl: './editing-toolbar.component.scss'
})
export class EditingToolbarComponent {
	overlayData = inject<{ actions: Signal<EditingToolbarButton[]> }>(OVERLAY_DATA_TOKEN);
}
