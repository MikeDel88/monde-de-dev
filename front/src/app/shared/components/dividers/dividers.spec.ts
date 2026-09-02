import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dividers } from './dividers';

describe('Dividers', () => {
  let component: Dividers;
  let fixture: ComponentFixture<Dividers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dividers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dividers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
