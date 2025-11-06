import { FileHandle, open } from "fs/promises";

/* We are creating this services to log during the real implementation
* drawing the pong game, thus get accure data about what's going on
* during this phase and why is blinking?
* The intention now is replace the console.logs for this service method
* to avoid writing on terminal and write in the opened file.*/
export class	Logger {
	private static	instance: Logger | undefined;
	private	file: Promise<FileHandle> | undefined;

	constructor() {
		if (Logger.instance)
			return (Logger.instance);
		Logger.instance = this;
		this.file = open("logger.txt", "w");
	}

	public	ft_log(data: string): void {
		this.file?.then((fh: FileHandle) => {
			fh.write(`[${Date.now()}]${data}\n`);
		});
	}
}
