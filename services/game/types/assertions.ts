/*Assertion Typescript functions*/
import { e_ACTION, e_PLAYER_STATE, e_TYPE_MESSAGE } from "@game-types/enums";

/*This validation of external messages is simple but hard to escalate, however
* the intention of this project is not focus on analyze a bucnh of them, maybe
* just a tiny set of messages, thus this validation is really enough and efficient.*/

export function	isStatusRequestMsg(msg: MessageGame): msg is StatusRequestMsg {
	if (msg.type !== e_TYPE_MESSAGE.STATUS_REQUEST)
		return (false);
	if (Object.entries(msg).length !== 2 || ! msg.body)
		return (false);
	const	body_entries = Object.entries(msg.body);
	if (body_entries.length !== 1)
		return (false);
	const	[[status]] = body_entries;
	if (status !== "status")
		return (false);
	if (msg.body.status < e_PLAYER_STATE.READY || msg.body.status > e_PLAYER_STATE.WAIT)
		return (false);
	return (true);
}

export function	isStateRequestMsg (msg: MessageGame) : msg is StateRequestMsg {
	if (msg.type !== e_TYPE_MESSAGE.STATE_REQUEST)
		return (false);
	if (Object.entries(msg).length !== 2 || ! msg.body)
		return (false);
	const	body_entries = Object.entries(msg.body);
	if (body_entries.length !== 1)
		return (false);
	const	[key] = body_entries[0];
	if (key !== "player")
		return (false);
	const	player_entries = Object.entries(msg.body[key]);
	if (player_entries.length !== 1)
		return (false);
	const	[key_player] = player_entries[0];
	if (key_player !== "action")
		return (false);
	if (msg.body.player.action < e_ACTION.UP || msg.body.player.action > e_ACTION.IDLE)
		return (false);
	return (true);
}
