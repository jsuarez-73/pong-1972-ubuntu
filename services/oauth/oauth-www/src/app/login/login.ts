import { Component, signal } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { GsiClient } from '../../types/oauth-www';
import { HttpClient } from '@angular/common/http';
import CONSTANTS_JSON from '../constants/constants.gen.json';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

	public		loginForm: FormGroup;
	private     id_configuration = {
		client_id: CONSTANTS_JSON.CONSTANTS.CLIENT_ID,
		login_uri: CONSTANTS_JSON.SERVICES.callback,
		ux_mode: "redirect"
	};
	private     gsi_client: GsiClient = globalThis.google;
	protected	is_invalid_token = signal(false);
	protected	modal_on = signal(false);
	private		MINIMAL_MILIS_LOADING = 2 * 1000;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private	activatedRoute: ActivatedRoute,
		private	http: HttpClient
	) {
		this.ft_initializeGoogleSignIn(this.id_configuration);
		this.ft_handleQueryParams(this.activatedRoute.snapshot.queryParamMap);
		this.loginForm = this.fb.group({
			email: ['',
				[
				  Validators.required,
				  Validators.email
				]
			],
			password: ['',
				[
				  Validators.required
				]
			]
		});
	}

	private ft_initializeGoogleSignIn(conf: any) {
		this.gsi_client.accounts.id.initialize(conf);
	}

	private	ft_handleQueryParams(query_params: ParamMap) {
		if (query_params.has("error")) {
			this.is_invalid_token.set(true);
		}
	}

  goRegister(): void {
    this.router.navigate(['web/register']);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
		this.modal_on.set(true);
		this.http.post<{redirect_uri: string}>(
			CONSTANTS_JSON.SERVICES.signin, {credential: this.loginForm.value}
		).subscribe({
			next: (res) => {
				console.log(res);
				setTimeout(() => {
					this.modal_on.set(false);
				}, this.MINIMAL_MILIS_LOADING);
				globalThis.location.assign(res.redirect_uri);
			}, 
			error: (error) => {
				console.log(error);
				setTimeout(() => {
					this.modal_on.set(false);
				}, this.MINIMAL_MILIS_LOADING);
			}
		});
    } else {
      console.error('Form invalid');
    }
  }
}
