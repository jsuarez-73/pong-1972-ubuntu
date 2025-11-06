import { ViewElement } from "@shared/element/element";
import { LabelElement } from "@shared/element/label.element";
import { ListElement } from "@shared/element/list.element";
import { RowElement } from "@shared/element/row.element";
import { ToggleElement } from "@shared/element/toggle.element";
import { Observer } from "@segfaultx/observable";
import { ChildViewModel } from "@viewmodel/child-viewmodel";

export class	DashBoardChallenges extends ChildViewModel {
	private	challenges: ListElement;

	constructor(context: Context) {
		super(context);
		this.challenges = new ListElement({
			start: {x: this.ctx.ch_start.x, y: this.ctx.ch_start.y},
			elements: this.ft_getChallengesElement(),
			max_rows: Math.floor(this.ctx.ch_size.y / 3)
		});
		this.challenges.ft_focus();
	}

	private	ft_getChallengesElement(): RowElement[] {
		const	rows: RowElement[] = [];
		const	challenges: ChallengeResponse = this.ctx.model.ft_getChallenges("user_name");
		if (challenges.challenges.length > 0) {
			challenges.challenges.forEach((challenge: ChallengeUnit) => {
				let	toggle = new ToggleElement().ft_listenEvents(new Observer((ev: EventElement) => {
					/*[!PENDING]: IMplement when the challenge was acepted.*/
							if (ev.payload?.is_accepted)
								this.ctx.model.ft_aceptChallenge(challenge.user, (res: string) => {
									console.log(`THE CHALLENGE WAS ACCEPTED! ${res}`);
								});
							else {
								this.ctx.model.ft_rejectChallenge(challenge.user, (res: string) => {
									console.log(`THE CHALLENGE WAS REJECTED! ${res}`);
								});
							}
							this.challenges.ft_setElements(...this.ft_getChallengesElement());
				}));
				rows.push(new RowElement({
					pad: this.ctx.ch_size.x - challenge.user.length - toggle.ft_getSize().x - 1,
					elements: [
						new LabelElement({}, challenge.user),
						toggle
					]
				}));
			});
		}
		return (rows);
	}

	public ft_getElements(): ViewElement[] {
	    return ([
			this.challenges
		]);
	}

	public ft_update(msg: MessageGame): void {
	    void msg;
	}

	public ft_handleKeys(char: string, key: Key): void {
	    this.challenges.ft_handleKeys(char, key);
	}
}
