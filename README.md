# SERVICES

The package.json for each service provide a debug run command. Allowing to run
the service with the environment variables defined in services-debug.env. The
DEBUG environment variables is compulsory to set properly the redirection port
in the HTTP Gateway service so http request can be redirect them back to HTTPS
Gateway service

When launching on docker the DEBUG flag can't be set because all the hostnames
for each service will default in "0.0.0.0" thus any redirection can't reach the
others services.

[OAUTH]:
The client type is relevant to show the access_form or the login page when a
client try to authenticate; the first one is for public client and the other
one is intended to confindetial ones.

The registration client scheme is:
```json
{
	"client_type": "public",
	"redirection_uri": "http://localhost:4200/callback",
	"public_key": {
		"n": "SDAKjsdlajsdkajlskkdjaklsdjAs_DASd",
		"e": "AQAB",
		"kty": "RSA"
	}
}
```

The state needed to request to auth endpoint must be 3 length and obscure to
others.

The redirect_uri field is ignored by the server.
