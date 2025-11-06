import { ClientDB, ClientId, SelectedResponse } from "@oauth-types/oauth";
import { JwtHeaderRsaPublicKey } from "@segfaultx/jwt";
import { Database } from "@segfaultx/sql";

export class	OauthDao {

	private	instance: OauthDao | undefined;
	private	database: Database = new Database();

	constructor () {
		if (this.instance != null)
			return (this.instance);
		this.instance = this;
		this.ft_createClientsTable();
		this.ft_createTokensTable();
	}

	private	ft_createClientsTable(): void {
		try {
			this.database.exec(`
				CREATE TABLE IF NOT EXISTS clients(
					client_id TEXT PRIMARY KEY,
					client_type TEXT,
					redirection_uri TEXT,
					public_key TEXT
				) STRICT
			`);
		}
		catch (e) {
			console.log(`[OAUTHDAO ERROR]: ${e}`);
		}
	}

	private	ft_createTokensTable(): void {
		try {
			this.database.exec(`
				CREATE TABLE IF NOT EXISTS tokens(
					client_id TEXT,
					token TEXT
				) STRICT
			`);
		}
		catch (e) {
			console.log(`[OAUTHDAO ERROR]: ${e}`);
		}
	}

	public	ft_clientRegistration(client: ClientDB): boolean {
		try {
			const	reg_stm = this.database.prepare(`
				INSERT INTO clients (
					client_id,
					client_type,
					redirection_uri,
					public_key
				) VALUES (
					$client_id,
					$client_type,
					$redirection_uri,
					$public_key
				)
			`);	
			const	client_register = {
				...client,
				public_key: JSON.stringify(client.public_key)
			};
			return (reg_stm.insert(client_register));
		}
		catch (e) {
			return (false);
		}
	}

	public	ft_isClientRegistered(client_id: string): boolean {
		const	validation_reg = this.database.prepare(`
			SELECT client_id FROM clients WHERE client_id=:client_id
		`);
		return (validation_reg.select({client_id: client_id}) != undefined ? true : false);
	}

	public	ft_getClient(client_id: ClientId): ClientDB | undefined {
		const	client = this.database.prepare(`
			SELECT * FROM clients WHERE client_id=:client_id
		`);
		const	client_sql = client.select({client_id: client_id}) as SelectedResponse<ClientDB>;
		let		client_db;
		if (client_sql != undefined) {
			client_db = {
				...client_sql,
				public_key: JSON.parse(client_sql.public_key)
			};
		}
		return (client_db);
	}

	public	ft_getRedirectionUri(client_id: ClientId): string | undefined {
		const	redirect_uri = this.database.prepare(`
			SELECT redirect_uri FROM clients WHERE client_id=:client_id
		`);
		return (redirect_uri.select({client_id: client_id}) as string | undefined);
	}
}
