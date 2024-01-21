import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextEditorImageActionComponent } from './text-editor-image-action.component';

describe('TextEditorImageActionComponent', () => {
  let component: TextEditorImageActionComponent;
  let fixture: ComponentFixture<TextEditorImageActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextEditorImageActionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TextEditorImageActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
