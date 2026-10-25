import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Category, Supabase } from '../../services/supabase/supabase';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
    private readonly supabase = inject(Supabase);

    getCategories(): Observable<Category[]> {
        return this.supabase.getCategories();
    }
}
