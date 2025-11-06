import {JwtHeader, JwtPayload, JwtSegment} from "@core/types/jwt-types";

export abstract class	Jwt {
	protected abstract	header: JwtHeader;
	protected abstract	payload: JwtPayload;

	protected		ft_encodeObject(obj: object): string {
		if (obj == undefined)
			return ("");
		return (Buffer.from(JSON.stringify(obj)).toString("base64url"));
	}

	public static	ft_decode(encoded: string): JwtSegment[] {
		const	obj_decoded = [];
		if (encoded != undefined) {
			const	[header, payload] = [...encoded.split(".")];
			try {
				const	header_decoded = Buffer.from(header, "base64url").toString();
				const	payload_decoded = Buffer.from(payload, "base64url").toString();
				obj_decoded.push(JSON.parse(header_decoded), JSON.parse(payload_decoded));
				return (obj_decoded);
			}
			catch (error) {
				console.error(error);
			}
		}
		return (obj_decoded);
	};

	public abstract	ft_encode(): string | Promise<string>;
}
