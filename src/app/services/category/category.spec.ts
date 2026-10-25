import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CategoryService } from './category';
import { Category } from '../supabase/supabase';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the categories provided by the API', () => {
    const categories: Category[] = [{ id: 1, name: 'Fé', slug: 'fe', display_order: 1 }];
    let result: Category[] | undefined;

    service.getCategories().subscribe((data) => (result = data));

    httpMock.expectOne((r) => r.url.includes('/rest/v1/categories')).flush(categories);

    expect(result).toEqual(categories);
  });
});
