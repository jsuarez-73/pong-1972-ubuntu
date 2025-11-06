/**
 * @param {alg} Mandatory for unencrypted jwt. main algorithm in use for signing 
 *				and/or decrypting this jwt. For unencrypted Jwt this claim must be set 
 *				to the value none.
 * @param {typ} The media type of jwt itself.This parameter is only meant to be used as 
 *				a help for uses where JWTs may be mixed with other objects carrying a JOSE
 *				header. In practice, this rarely happens. When present, this claim should 
 *				be set to the value JWT.
 * @param {cty} The content type. Most JWTs carry specific claims plus arbitrary data as
 *				part of their payload. For this case, the content type claim must not be 
 *				set. For instances where the payload is a JWT itself (a nested JWT), this 
 *				claim must be present and carry the value JWT. This tells the 
 *				implementation that further processing of the nested JWT is required.
 *				Nested JWTs are rare, so the cty claim is rarely present in headers
 */
export interface	JwtHeaderInsecure {
	alg: string,
	typ?: "JWT",
	cty?: "JWT"
}

/*
@param {jku} JSON Web Key (JWK) Set URL. A URI pointing to a set of JSON-encoded public keys used to sign this JWT. Transport security (such as TLS for HTTP) must be used to retrieve the keys. The format of the keys is a JWK Set
@param {jwk} JSON Web Key. The key used to sign this JWT in JSON Web Key format
@param {kid} Key ID. A user-defined string representing a single key used to sign this JWT. This claim is used to signal key signature changes to recipients (when multiple keys are used).
@param {x5u} X.509 URL. A URI pointing to a set of X.509 (a certificate format standard) public certificates encoded in PEM form.
@param {x5c} X.509 certificate chain. A JSON array of X.509 certificates used to sign this JWS. Each certificate must be the Base64-encoded value of its DER PKIX representation
@param {x5t} 509 certificate SHA-1 fingerprint. The SHA-1 fingerprint of the X.509 DER-encoded certificate used to sign this JWT.
@param {x5tsha256} Identical to x5t, but uses SHA-256 instead of SHA-1.
@param {typ} Identical to the typ value for unencrypted JWTs, with additional values “JOSE” and “JOSE+JSON” used to indicate compact serialization and JSON serialization, respectively. This is only used in cases where similar JOSE-header carrying objects are mixed with this JWT in a single container.
@param {crit} from critical. An array of strings with the names of claims that are present in this same header used as implementation-defined extensions that must be handled by parsers of this JWT. It must either contain the names of claims or not be present (the empty array is not a valid value)
*/
export interface	JwtHeaderSignature {
	alg: string,
	typ?: "JWT" | "JOSE" | "JOSE+JSON",
	cty?: "JWT",
	jku?: string,
	jwk?: string,
	kid?: string,
	x5u?: string,
	x5c?: JSON,
	x5t?: string,
	x5tsha256?: string,
	crit?: string[]
}

/*
@param {kty} key type”. This claim differentiates types of keys. Supported types are EC, for elliptic curve keys; RSA for RSA keys; and oct for symmetric keys.
*@param {use} this claim specifies the intended use of the key. There are two possible uses: sig (for signature) and enc (for encryption). This claim is optional. The same key can be used for encryption and signatures, in which case this member should not be present.
*@param {key_ops} an array of string values that specifies detailed uses for the key. Possible values are: sign, verify, encrypt, decrypt, wrapKey, unwrapKey, deriveKey, deriveBits. Certain operations should not be used together. For instance, sign and verify are appropriate for the same key, while sign and encrypt are not. This claim is optional and should not be used at the same time as the use claim. In cases where both are present, their content should be consistent.
*@param {alg} “algorithm”. The algorithm intended to be used with this key. It can be any of the algorithms admitted for JWE or JWS operations
*@param {kid} Key ID. A user-defined string representing a single key used to sign this JWT. This claim is used to signal key signature changes to recipients (when multiple keys are used).
*@param {x5u} X.509 URL. A URI pointing to a set of X.509 (a certificate format standard) public certificates encoded in PEM form.
*@param {x5c} X.509 certificate chain. A JSON array of X.509 certificates used to sign this JWS. Each certificate must be the Base64-encoded value of its DER PKIX representation
@param {x5t} 509 certificate SHA-1 fingerprint. The SHA-1 fingerprint of the X.509 DER-encoded certificate used to sign this JWT.
*@param {x5tsha256} Identical to x5t, but uses SHA-256 instead of SHA-1.
*/
export interface	JwtHeaderKey {
	kty: string,
	use?: "sig" | "enc",
	key_ops?: ("sign" | "verify" | "encrypt" | "decrypt" | "wrapKey" | "unwrapKey" | "deriveKey" | "deriveBits")[],
	alg?: string,
	kid?: string,
	x5u?: string,
	x5c?: JSON,
	x5t?: string,
	x5tsha256?: string,
}

/*
@param {n} public key's module base64-url encoded
@param {e} public key's exponent base64-url encoded
*/
export interface	JwtHeaderRsaPublicKey extends JwtHeaderKey {
	n: string,
	e: string
}

/*
@param {iss} from the word issuer. A case-sensitive string or URI that uniquely identifies the party that issued the JWT.(Think as an id for the client which issue the jwt)
@param {sub} from the word subject. A case-sensitive string or URI that uniquely identifies the party that this JWT carries information about. In other words, the claims contained in this JWT are statements about this party.(Think as an id about the information carry out by the jwt)
@param {aud}  from the word audience. Either a single case-sensitive string or URI or an array of such values that uniquely identify the intended recipients of this JWT. In other words, when this claim is present, the party reading the data in this JWT must find itself in the aud claim or disregard the data contained in the JWT.
@param {exp} from the word expiration (time). A number representing a specific date and time in the format “seconds since epoch” as defined by POSIX6. This claims sets the exact moment from which this JWT is considered invalid.
@param {nbf}  from not before (time). The opposite of the exp claim. A number representing a specific date and time in the format “seconds since epoch” as defined by POSIX7. This claim sets the exact moment from which this JWT is considered valid
@param {iat} from issued at (time). A number representing a specific date and time (in the same format as exp and nbf ) at which this JWT was issued.
@param {jti} from JWT ID. A string representing a unique identifier for this JWT. This claim may be used to differentiate JWTs with other similar content (preventing replays, for instance). It is up to the implementation to guarantee uniqueness.
*/
export interface	RegisteredClaims {
	iss?: string,
	sub?: string,
	aud?: string,
	exp?: number,
	nbf?: number,
	iat?: number,
	jti?: string
}

export interface	JwtPayloadInsecure extends RegisteredClaims {
	[index: string]: any
}

export interface	JwtPayloadSecure extends JwtPayloadInsecure {};

export type	JwtHeader = JwtHeaderInsecure | JwtHeaderSignature;
export type	JwtSegment = JwtHeader | JwtPayload;
export type	JwtPayload = JwtPayloadInsecure | JwtPayloadSecure;
export type	JwtEncoded = {
	header: string,
	payload: string
};

export interface	JwtObject {
	header: JwtHeader,
	payload: JwtPayload,
}
