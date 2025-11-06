import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathError } from './path-error';

describe('PathError', () => {
  let component: PathError;
  let fixture: ComponentFixture<PathError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathError]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathError);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
