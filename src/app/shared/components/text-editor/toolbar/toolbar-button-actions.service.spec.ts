import { TestBed } from '@angular/core/testing';

import { ToolbarButtonActionsService } from './toolbar-button-actions.service';

describe('ToolbarButtonServiceService', () => {
  let service: ToolbarButtonActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolbarButtonActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
