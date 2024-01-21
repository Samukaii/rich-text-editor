import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextEditorListActionComponent } from './text-editor-list-action.component';

describe('ListBulletsButtonComponent', () => {
  let component: TextEditorListActionComponent;
  let fixture: ComponentFixture<TextEditorListActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextEditorListActionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextEditorListActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
