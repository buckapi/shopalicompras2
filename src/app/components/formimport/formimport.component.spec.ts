import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormimportComponent } from './formimport.component';

describe('FormimportComponent', () => {
  let component: FormimportComponent;
  let fixture: ComponentFixture<FormimportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormimportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormimportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
