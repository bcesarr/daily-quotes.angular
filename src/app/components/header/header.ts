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

  // Controla se o menu hambúrguer do celular está aberto.
  protected readonly isHeaderMenuOpen = signal(false);

  protected toggleHeaderMenu(): void {
    this.isHeaderMenuOpen.update((open) => !open);
  }

  // Fecha o menu hambúrguer e também a lista de categorias que estiver aberta dentro dele.
  protected closeHeaderMenu(): void {
    this.isHeaderMenuOpen.set(false);
    this.closeCategoriesMenu();
  }

  // Esc com a lista de categorias aberta fecha SÓ a lista (e não o menu inteiro).
  protected onCategoriesMenuEscape(event: Event, categoriesButton: HTMLButtonElement): void {
    if (!this.isCategoriesMenuOpen()) {
      return;
    }

    event.stopPropagation();
    this.closeCategoriesMenu();
    categoriesButton.focus();
  }

  // Esc com o menu hambúrguer aberto fecha o menu e devolve o foco ao botão hambúrguer.
  protected onHeaderMenuEscape(headerMenuButton: HTMLButtonElement): void {
    if (!this.isHeaderMenuOpen()) {
      return;
    }

    this.closeHeaderMenu();
    headerMenuButton.focus();
  }

  // Clique fora da lista de categorias fecha a lista; clique fora do cabeçalho fecha o menu todo.
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target;
    const clickedInsideCategories = target instanceof Element && target.closest('.dropdown-container') !== null;
    const clickedInsideHeader = target instanceof Element && target.closest('header') !== null;

    if (!clickedInsideCategories) {
      this.closeCategoriesMenu();
    }

    if (!clickedInsideHeader) {
      this.closeHeaderMenu();
    }
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
