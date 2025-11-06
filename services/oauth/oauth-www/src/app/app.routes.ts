import { Routes } from '@angular/router';
import { Login } from './login/login';
import { AccessForm } from './access-form/access-form';
import { PathError } from './path-error/path-error';

export const routes: Routes = [
    {path: "v1/authorization/login", component: Login},
	{path: "v1/authorization/access_form", component: AccessForm},
	{path: "v1/authorization/error", component: PathError}
];
