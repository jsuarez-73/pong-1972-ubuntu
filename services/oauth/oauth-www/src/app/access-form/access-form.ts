import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import CONSTANTS_JSON from '../constants/constants.gen.json';

@Component({
  selector: 'app-access-form',
  imports: [],
  templateUrl: './access-form.html',
  styleUrl: './access-form.css'
})
export class AccessForm {
	
	private	access_uri = CONSTANTS_JSON.SERVICES.access;

	constructor (
		private http: HttpClient
	) {
		
	}

	protected	ft_denyAccess(): void {
		this.http.post<{redirect_uri: string}>(this.access_uri, {
			access: "denied"
		}).subscribe((res) => {
			console.log(res);
			globalThis.location.assign(res.redirect_uri);
		});
	}

	protected	ft_allowAccess(): void {
		this.http.post<{redirect_uri: string}>(this.access_uri, {
			access: "allowed"
		}).subscribe((res) => {
			console.log(res);
			globalThis.location.assign(res.redirect_uri);
		});
	}
}
