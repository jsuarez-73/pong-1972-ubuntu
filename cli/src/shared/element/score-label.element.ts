import { e_ASCII_ART_FONT } from "@cli-types/enums";
import { Unicode } from "@shared/chars/chars";
import { NumbersAsciiArt } from "@shared/chars/numbers";
import { LabelElement } from "@shared/element/label.element";

export class	ScoreLabel extends LabelElement {

	private	score_p1: number = 0;
	private	score_p2: number = 0;
	private	score = NumbersAsciiArt.ft_getAsciiArtDigits(e_ASCII_ART_FONT.MINIWI);
	private	padding: number = 3;

	constructor(config?: ConfigLabelElement, ...scores: number[]) {
		super(config);
		if (scores.length != 2 || scores[0] < 0 || scores[0] > 5 || scores[1] < 0 || scores[1] > 5)
			throw new Error("Wrong Scores numbers");
		this.ft_setScore(scores[0], scores[1]);
	}

	public	ft_setScore(score_p1: number, score_p2: number): void {
		if (score_p1 > 5 || score_p2 > 5 || score_p1 < 0 || score_p2 < 0)
			return ;
		const	texts = [];
		this.score_p1 = score_p1;
		this.score_p2 = score_p2;
		let	sc_p1_str = this.score[this.score_p1];
		let	sc_p2_str = this.score[this.score_p2];
		let	middle_pad = (this.padding - 1) / 2;
		let middle_lf_pad = Math.floor(middle_pad);
		let	middle_rg_pad = Math.round(middle_pad);
		let	middle_text = " ".repeat(middle_lf_pad) + Unicode.CHARS.lo_eight + " ".repeat(middle_rg_pad);
		texts.push(" " + sc_p1_str[0] + " ".repeat(this.padding) + sc_p2_str[0] + " ");
		texts.push(" " + sc_p1_str[1] + middle_text + sc_p2_str[1] + " ");
		texts.push(" " + sc_p1_str[2] + " ".repeat(this.padding) + sc_p2_str[2] + " ");
		this.ft_setTexts(texts);
	}
}
