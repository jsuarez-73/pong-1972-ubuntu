import { Jwt } from "@core/ajwt";
import {JwtHeaderInsecure, JwtPayload, JwtPayloadInsecure} from "@core/types/jwt-types";

export class	JwtInsecure extends Jwt {

	protected	_header: JwtHeaderInsecure = {alg: "none"};
	protected	_payload: JwtPayloadInsecure = {};

	get			header() {return (this._header);}
	set			header(jhi: JwtHeaderInsecure) {this._header = {...jhi, alg: "none"}}
	get			payload() {return (this._payload);}
	set			payload(jp: JwtPayload) {this._payload = jp}

	constructor (config?: {header?: JwtHeaderInsecure, payload?: JwtPayloadInsecure}) {
		super();
		if (config != undefined) {
			if (config.header != undefined)
				this._header = {...config.header, ...this.header};
			if (config.payload != undefined)
				this._payload = config.payload;
		}
	}

	public ft_encode(): string {
	    const	header_enconded = this.ft_encodeObject(this.header);
		const	payload_encoded = this.ft_encodeObject(this.payload);
		return (`${header_enconded}.${payload_encoded}.`);
	}

	public static	ft_decodeInsecure(encoded: string): JwtInsecure {
		const	[header_decoded, payload_decoded] = this.ft_decode(encoded);
		return (new JwtInsecure({
			header: header_decoded as JwtHeaderInsecure,
			payload: payload_decoded as JwtPayloadInsecure
		}));
	}
}
