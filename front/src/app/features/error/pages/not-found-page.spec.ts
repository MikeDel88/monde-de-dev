import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotFoundPage } from './not-found-page';
import { provideRouter } from '@angular/router';
import { routes } from '../../../app.routes';

describe('NotFoundPage', () => {
  let component: NotFoundPage;
  let fixture: ComponentFixture<NotFoundPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [provideRouter(routes)],
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotFoundPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
