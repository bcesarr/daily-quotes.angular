import { Component, DestroyRef, inject, OnInit, signal, } from '@angular/core';
import { RouterLink } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Category } from '../../services/supabase/supabase';
import { CategoryService } from '../../services/category/category';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Header implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly categories = signal<Category[]>([]);

  // Controla se o menu "Categorias" está aberto (usado por teclado, toque e clique).
  protected readonly isCategoriesMenuOpen = signal(false);

  protected toggleCategoriesMenu(): void {
    this.isCategoriesMenuOpen.update((open) => !open);
  }

  protected closeCategoriesMenu(): void {
    this.isCategoriesMenuOpen.set(false);
  }

  // Fecha o menu ao clicar em qualquer lugar fora dele.
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target;

    if (target instanceof Element && target.closest('.dropdown-container')) {
      return;
    }

    this.closeCategoriesMenu();
  }

  ngOnInit(): void {
    this.categoryService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
        },
        error: (error) => {
          console.error('Erro ao carregar categorias:', error);
        },
      });
  }
}
