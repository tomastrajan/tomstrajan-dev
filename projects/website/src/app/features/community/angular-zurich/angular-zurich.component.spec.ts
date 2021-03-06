import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularZurichComponent } from './angular-zurich.component';

describe('AngularZurichComponent', () => {
  let component: AngularZurichComponent;
  let fixture: ComponentFixture<AngularZurichComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AngularZurichComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AngularZurichComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
