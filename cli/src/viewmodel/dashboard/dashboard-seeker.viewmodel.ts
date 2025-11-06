import { e_Colors } from "@cli-types/enums";
import { ViewElement } from "@shared/element/element";
import { LabelElement } from "@shared/element/label.element";
import { ListElement } from "@shared/element/list.element";
import { RowElement } from "@shared/element/row.element";
import { SelectElement } from "@shared/element/select.element";
import { TextArea } from "@shared/element/textarea.element";
import { Observer } from "@segfaultx/observable";
import { ChildViewModel } from "@viewmodel/child-viewmodel";

export class	DashBoardSeeker extends ChildViewModel {

	private	seeker: SelectElement;
	private	observer: Observer<EventElement>;

	constructor(context: Context) {
		super(context);
		this.seeker = new SelectElement({
			start: {x: this.ctx.ch_start.x, y: this.ctx.ch_start.y},
			size: {x: this.ctx.ch_size.x, y: 2},
			max_rows: Math.floor((this.ctx.ch_size.y - 4) / 3)
		});
		this.seeker.ft_focus();
		this.observer = new Observer((ev: EventElement) => this.ft_handleSelectEvents(ev));
		this.seeker.ft_listenEvents(this.observer);
	}

	private	ft_handleSelectEvents(ev: EventElement): void {
		if (ev.emitter instanceof TextArea) {
			const	list_match: MatchResponse = this.ctx.model.ft_seekMatchs(ev.payload?.text_box);
			if (list_match.matchs.length > 0) {
				this.seeker.ft_setElements(this.ft_createElements(list_match.matchs));
			}
		}
		else if (ev.emitter instanceof ListElement) {
			/*[!PENDING]: Implement when the row is selected to challenge a new player.*/
		}
	}

	/*[!PENDING]: Might be needed a third color: yellow to let the user know the seeked user
	* is not available.*/
	private	ft_createElements(matchs: MatchUnit[]): RowElement[] {
		const	rows: RowElement[] = [];
		matchs.forEach((match: MatchUnit) => {
			const	row = new RowElement({
				pad: this.ctx.ch_size.x - match.user.length - 3,
				elements: [
					new LabelElement({}, match.user),
					new LabelElement({style: {
						bg: match.status === 0 ? e_Colors.BG_RED : e_Colors.BG_GREEN
					}}, "  ")
				]
			});
			rows.push(row);
		});
		return (rows);
	}

	public ft_getElements(): ViewElement[] {
	    return ([
			this.seeker
		]);
	}

	public ft_update(msg: MessageGame): void {
	    void msg;
	}

	public ft_handleKeys(char: string, key: Key): void {
		this.seeker.ft_handleKeys(char, key);
	}
}
