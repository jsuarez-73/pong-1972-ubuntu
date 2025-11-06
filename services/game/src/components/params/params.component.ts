import { e_GAME_CONSTANTS } from "@game-types/enums";

export const PHI = 1;
/*omega: is intended to compare differences very small.
*epsilon: is intended to compare differences between a point with the ball 
circunference.
*steps_per_action: it's the number of point moved when a player goes up or down.*/
export const PARAMS = {
	vel_x : 1 * PHI,
	vel_y: - Math.sqrt(3) * PHI,
	upper_bound: e_GAME_CONSTANTS.HEIGHT / 2,
	lower_bound: -e_GAME_CONSTANTS.HEIGHT / 2,
	rigth_bound: (e_GAME_CONSTANTS.WIDTH / 2) - e_GAME_CONSTANTS.RACQUET_THICK,
	left_bound: -e_GAME_CONSTANTS.WIDTH / 2 + e_GAME_CONSTANTS.RACQUET_THICK,
	epsilon: e_GAME_CONSTANTS.BALL / 2,
	omega: 0.1,
	delta_y: e_GAME_CONSTANTS.RACQUET / 2,
	time_step: 1,
	ball_x_start: 0,
	ball_y_start: (e_GAME_CONSTANTS.HEIGHT - e_GAME_CONSTANTS.BALL) / 2,
	points_to_win: 5,
	steps_per_action: e_GAME_CONSTANTS.HALF_RACQUET
};
/*@author-comment: This is just a silly reference for really hard core programmers.
* please don't confuse with bps rate. Terminals also use bauds-rates.
* Here represent milliseconds. The 1 / T is avoided for simplicity.*/
export const	BAUD_RATE = 10;
export const	WAIT_SCORED_TIME = 2000;
