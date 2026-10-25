import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { LoginPage } from './pages/login-page/login-page';
import { SignUpPage } from './pages/sign-up-page/sign-up-page';
import { ResetPasswordPage } from './pages/reset-password-page/reset-password-page';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'entrar', component: LoginPage },
    { path: 'cadastre-se', component: SignUpPage },
    { path: 'recuperar-senha', component: ResetPasswordPage },
    { path: 'categorias/:slug', component: Home },
    // { path: 'categorias/fe', component: Home },
    // { path: 'categorias/motivacao', component: Home },
    // { path: 'categorias/disciplina', component: Home },
    { path: 'sobre', component: About },
    { path: '404', component: NotFound },
    { path: '**', redirectTo: '404' }
];
