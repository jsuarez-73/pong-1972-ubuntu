export const	CONSTANTS = {
	PORT:  parseInt(process.env.GAME_PORT ?? "3000"),
	VERSION_API: "v1",
	SHARED_FOLDER: process.env.SHARED_FOLDER ?? "../../../../shared"
};

export const	SERVICES = {
	/*The optional param (id) will be undefined when not specified.
		* Routes allowed: v1/game/ and v1/game/1 */
	game: `/${CONSTANTS.VERSION_API}/game/:id?`,
	train: `/${CONSTANTS.VERSION_API}/train/:id/:user?`
};
