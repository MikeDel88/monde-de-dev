import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Error } from './error';
import { provideRouter } from '@angular/router';
import { routes } from '../../../app.routes';

describe('Error', () => {
  let component: Error;
  let fixture: ComponentFixture<Error>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Error],
      providers: [provideRouter(routes)],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Error);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
