import { TextFont } from "@shared/textfonts/textfont";

export class	CountDownTextFont extends TextFont {
	public static labels: {[index:string]: string[][]} = {
		counterdown_finish: [
			[
				"▄▖      ▗     ▄           ",
				"▌ ▛▌▌▌▛▌▜▘█▌▛▘▌▌▛▌▌▌▌▛▌ ▖ ",
				"▙▖▙▌▙▌▌▌▐▖▙▖▌ ▙▘▙▌▚▚▘▌▌ ▖ "
			],
			[
				"CounterDown : "
			],
			[
				"CD:"
			]
		]
	}
}
