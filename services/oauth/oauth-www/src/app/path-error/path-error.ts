import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-path-error',
  imports: [],
  templateUrl: './path-error.html',
  styleUrl: './path-error.css'
})
export class PathError {
	protected	error_dscp = new Map<string, string>([
		["redirect_uri", "The client has provided an invalid redirection uri."],
		["client_id","The client has provided an invalid identifier."],
		["gsi_access_denied", "The resource owner has denied the access."]
	]);
	private	params: ParamMap;
	protected	type?: string;
	protected	description?: string;

	constructor (
		router: ActivatedRoute
	) {
		this.params = router.snapshot.queryParamMap;
		if (this.params.has("error")) {
			this.type = this.params.get("error")!;
			this.description = this.error_dscp.get(this.type);
		}
	}
}
