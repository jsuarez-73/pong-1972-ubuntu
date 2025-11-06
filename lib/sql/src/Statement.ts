import { StatementSync } from 'node:sqlite';

export class Statement {

	constructor(private readonly stmt: StatementSync) {
		this.stmt.setAllowBareNamedParameters(true);
	}

	/* This method executes a prepared statement and returns the first result 
	 * as an object. If the prepared statement does not return any results, 
	 * this method returns undefined.
	 */
	public get(params?: any[] | Record<string, any>): Object | undefined {
		try {
			if (Array.isArray(params))
				return this.stmt.get(...params);
			if (typeof params === 'object' && params !== null)
				return this.stmt.get(params);
			return this.stmt.get();
		} catch (error: any) {
			// Usamos 'error: any' para acceder a 'error.message' de forma segura
			throw new Error(`Failed to fetch single row: ${error.message}`);
		}
	}

	/* Returns: <Array> An array of objects. Each object corresponds to a row 
	 * returned by executing the prepared statement. 
	 * The keys and values of each object correspond to the column names and 
	 * values of the row.
	 */
	public all(params?: any[] | Record<string, any>): any[] {
		try {
			if (Array.isArray(params))
				return this.stmt.all(...params);
			else if (typeof params === 'object' && params !== null)
				return this.stmt.all(params);
			return this.stmt.all();
		} catch (error: any) {
			throw new Error(`Failed to fetch result set: ${error.message}`);
		}
	}

	/* This method executes a prepared statement and returns an object 
	 * summarizing the resulting changes.
	 */
	public run(params?: any[] | Record<string, any>): RunResult {
		try {
			if (Array.isArray(params))
				return this.stmt.run(...params);
			else if (typeof params === 'object' && params !== null)
				return this.stmt.run(params);
			return this.stmt.run();
		} catch (error: any) {
			throw new Error(`Statement execution failed: ${error.message}`);
		}
	}

	//-------------------------------------------------------------------------

	public select(params?: any[] | Record<string, any>): Object | undefined {
		return this.get(params);
	}

	public selectAll(params?: any[] | Record<string, any>): any[] {
		return this.all(params);
	}

	public insert(params?: any[] | Record<string, any>): boolean {
		const result: RunResult = this.run(params);
		return (result.lastInsertRowid > 0)
	}

	public update(params?: any[] | Record<string, any>): boolean {
		const result: RunResult = this.run(params);
		return (result.changes > 0)
	}

	public delete(params?: any[] | Record<string, any>): boolean {
		const result: RunResult = this.run(params);
		return (result.changes > 0)
	}

}
