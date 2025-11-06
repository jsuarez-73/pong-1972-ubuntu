import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessForm } from './access-form';

describe('AccessForm', () => {
  let component: AccessForm;
  let fixture: ComponentFixture<AccessForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
