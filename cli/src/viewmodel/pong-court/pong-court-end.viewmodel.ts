import { e_GAME_STATE, e_TAG_PLAYER } from "@cli-types/enums";
import { ViewElement } from "@shared/element/element";
import { LabelFonted } from "@shared/element/label-fonted.element";
import { PongCourtEndTextFont } from "@shared/textfonts/pong-court-end.textfont";
import { ChildViewModel } from "@viewmodel/child-viewmodel";

export class	PongCourtEnd extends ChildViewModel {

	private	tag: e_TAG_PLAYER | undefined;
	private	winner_text = new LabelFonted({texts: PongCourtEndTextFont.labels.winner});
	private	loser_text_one = new LabelFonted({texts: PongCourtEndTextFont.labels.loser});
	private	loser_text_two = new LabelFonted({texts: PongCourtEndTextFont.labels.loser});
	private	winner: e_TAG_PLAYER | undefined;
	private	losers: e_TAG_PLAYER[] | undefined;

	constructor(context: Context) {
		super(context);
		this.ft_selectFont();
		this.loser_text_two.ft_setStart({
			x: this.ctx.start_game.x + 1 + 3 * this.ctx.sc_size_game.x / 4 - this.loser_text_two.ft_getSize().x / 2,
			y: this.ctx.start_game.y + this.ctx.sc_size_game.y / 2 - this.loser_text_two.ft_getSize().y / 2
		});
		this.loser_text_one.ft_setStart({
			x: this.ctx.start_game.x + 1 + this.ctx.sc_size_game.x / 4 - this.loser_text_one.ft_getSize().x / 2,
			y: this.ctx.start_game.y + this.ctx.sc_size_game.y / 2 - this.loser_text_one.ft_getSize().y / 2
		});
	}

	private	ft_selectFont(): void {
		const	space = {
			x: (this.ctx.sc_size_game.x / 2),
			y: (this.ctx.sc_size_game.y / 2)
		};
		let	labels_mixed: LabelFontedMixed[] = [
			this.winner_text,
			this.loser_text_one
		];
		const	font = LabelFonted.ft_selectFont(space, labels_mixed);
		this.winner_text.ft_setFont(font);
		this.loser_text_one.ft_setFont(font);
		this.loser_text_two.ft_setFont(font);
	}

	public ft_getElements(): ViewElement[] {
		let	elements: ViewElement[] = [];
		if (this.winner !== undefined)
			elements.push(this.winner_text);
		this.losers?.forEach((loser: e_TAG_PLAYER) => {
			switch (loser) {
				case e_TAG_PLAYER.ONE:
					elements.push(this.loser_text_one);
					break ;
				case e_TAG_PLAYER.TWO:
					elements.push(this.loser_text_two);
					break ;
			}
		})
	    return (elements);
	}

	public	ft_setStartWinner(): void {
		switch (this.winner) {
			case e_TAG_PLAYER.ONE:
				this.winner_text.ft_setStart({
					x: this.ctx.start_game.x + 1 + this.ctx.sc_size_game.x / 4 - this.winner_text.ft_getSize().x / 2,
					y: this.ctx.start_game.y + this.ctx.sc_size_game.y / 2 - this.winner_text.ft_getSize().y / 2
				});
				break ;
			case e_TAG_PLAYER.TWO:
				this.winner_text.ft_setStart({
					x: this.ctx.start_game.x + 1 + 3 * this.ctx.sc_size_game.x / 4 - this.winner_text.ft_getSize().x / 2,
					y: this.ctx.start_game.y + this.ctx.sc_size_game.y / 2 - this.winner_text.ft_getSize().y / 2
				});
				break ;
		}
	}

	public ft_update(msg: NotificationMsg): void {
		this.tag = this.tag ?? msg.tag;
		if (msg.body.status === e_GAME_STATE.FINISH) {
			this.winner = msg.body.payload.winner;
			this.losers = msg.body.payload.losers;
			if (this.winner !== undefined)
				this.ft_setStartWinner();
		}
	}

	public ft_handleKeys(_char: string, key: Key): void {
	    /*[!TODO]: Set the keys to redirect to dashboard.
		* Implements the Login View.
		* Implements the Dashboard View*/
	}
}
