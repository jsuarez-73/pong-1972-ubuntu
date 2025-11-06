import { DatabaseSync } from 'node:sqlite';
import { Statement } from '@core/Statement';

export class Database {
	
	private db: DatabaseSync;
	private isOpen: boolean = false;

	constructor(private readonly dbFile: string = process.env.DB_PATH || './default.db') {
		try {
			this.db = new DatabaseSync(this.dbFile);
			this.isOpen = this.db.isOpen;
		} catch (error: any) {
			throw new Error(`Error initializing database connection: ${error.message}`);
		}
	}

	public prepare(sql: string): Statement {
		this.ensureOpen();

		try {
			const stmt = this.db.prepare(sql);
			return new Statement(stmt);
		} catch (error: any) {
			throw new Error(`Failed to prepare statement: ${sql} -> ${error.message}`);
		}
	}

	public exec(sql: string): void {
		this.ensureOpen();

		try {
			this.db.exec(sql);
		} catch (error: any) {
			throw new Error(`Failed to execute raw SQL: ${sql} -> ${error.message}`);
		}
	}

	public close(): void {
		if (!this.isOpen) return;

		try {
			this.db.close();
			this.isOpen = false;
		} catch (error: any) {
			throw new Error(`Failed to close the database: ${error.message}`);
		}
	}

	private ensureOpen(): void {
		if (!this.db.isOpen) {
			throw new Error('Database is not open');
		}
	}
}

