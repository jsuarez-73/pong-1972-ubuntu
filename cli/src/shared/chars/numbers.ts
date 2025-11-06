import { e_ASCII_ART_FONT } from "@cli-types/enums";

export class	NumbersAsciiArt {

	public static	default: string[][] = [
		["0"],
		["1"],
		["2"],
		["3"],
		["4"],
		["5"],
		["6"],
		["7"],
		["8"],
		["9"]
	];

	public static	art_font: Map<e_ASCII_ART_FONT, string[][]> = new Map([
		[
			e_ASCII_ART_FONT.SHADOW,
			[
				[" ██████╗ ", "██╔═████╗", "██║██╔██║", "████╔╝██║", "╚██████╔╝", " ╚═════╝ "],
				[" ██╗     ", "███║     ", "╚██║     ", " ██║     ", " ██║     ", " ╚═╝     "],
				["██████╗  ", "╚════██╗ ", " █████╔╝ ", "██╔═══╝  ", "███████╗ ", "╚══════╝ "],
				["██████╗  ", "╚════██╗ ", " █████╔╝ ", " ╚═══██╗ ", "██████╔╝ ", "╚═════╝  "],
				["██╗  ██╗ ", "██║  ██║ ", "███████║ ", "╚════██║ ", "     ██║ ", "     ╚═╝ "],
				["███████╗ ", "██╔════╝ ", "███████╗ ", "╚════██║ ", "███████║ ", "╚══════╝ "],
				[" ██████╗ ", "██╔════╝ ", "███████╗ ", "██╔═══██╗", "╚██████╔╝", " ╚═════╝ "],
				["███████╗ ", "╚════██║ ", "    ██╔╝ ", "   ██╔╝  ", "   ██║   ", "   ╚═╝   "],
				[" █████╗  ", "██╔══██╗ ", "╚█████╔╝ ", "██╔══██╗ ", "╚█████╔╝ ", " ╚════╝  "],
				[" █████╗  ", "██╔══██╗ ", "╚██████║ ", " ╚═══██║ ", " █████╔╝ ", " ╚════╝  "]
			],
		],
		[
			e_ASCII_ART_FONT.MINIWI,
			[
				["▄▖", "▛▌", "█▌"],
				["▗ ", "▜ ", "▟▖"],
				["▄▖", "▄▌", "▙▖"],
				["▄▖", "▄▌", "▄▌"],
				["▖▖", "▙▌", " ▌"],
				["▄▖", "▙▖", "▄▌"],
				["▄▖", "▙▖", "▙▌"],
				["▄▖", " ▌", " ▌"],
				["▄▖", "▙▌", "▙▌"],
				["▄▖", "▙▌", "▄▌"]
			]
		]
	]);

	public static	ft_getAsciiArtDigits(ascii_font?: e_ASCII_ART_FONT): string[][] {
		if (ascii_font === undefined || ascii_font === e_ASCII_ART_FONT.DEFAULT)
			return (NumbersAsciiArt.default);
		const	digits = NumbersAsciiArt.art_font.get(ascii_font);
		if (digits === undefined)
			return (NumbersAsciiArt.default);
		return (digits);
	}
	public static	ft_getAsciiArtFontLength(ascii_font?: e_ASCII_ART_FONT): number {
		if (ascii_font === undefined)
			return (0);
		else if (ascii_font === e_ASCII_ART_FONT.DEFAULT)
			return (NumbersAsciiArt.default[0].length);
		const	digits = NumbersAsciiArt.art_font.get(ascii_font);
		return ((digits !== undefined && digits[0] !== undefined) ? digits[0].length : 0);
	}
}
