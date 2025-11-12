import { e_TAG_PLAYER } from "@game-types/enums";
import { Referee } from "./referee.component";
import { GlobalStateTrain } from "../state/state-train.component";

export class	RefereeTrain	extends Referee {

	constructor (global_state: GlobalStateTrain) {
		super(global_state);
	}

	public	ft_setWatcherGlobalState(watcher: e_TAG_PLAYER | undefined): void {
		if (watcher != undefined)
			(this.global_state as GlobalStateTrain).trainer = watcher;
	}
}
