import { e_ASCII_ART_FONT, e_LABEL_SIZE } from "@cli-types/enums";
import { NumbersAsciiArt } from "@shared/chars/numbers";
import { LabelFonted } from "@shared/element/label-fonted.element";

export class	CounterDownLabelFonted extends LabelFonted {
	private	ascii_digits: string[][] = [[]];
	private	ascii_art_length: number = 0;
	private	ascii_fonts: e_ASCII_ART_FONT[] = [];

	constructor(art_fonts?: e_ASCII_ART_FONT[], config?: ConfigLabelFonted) {
		super(config);
		if (art_fonts !== undefined)
			this.ft_setAsciiFonts(art_fonts[0], art_fonts[1]);
	}

	public	ft_setAsciiFonts(large?: e_ASCII_ART_FONT, medium?: e_ASCII_ART_FONT): void {
		this.ascii_fonts = [
			large ?? e_ASCII_ART_FONT.DEFAULT,
			medium ?? e_ASCII_ART_FONT.DEFAULT,
			e_ASCII_ART_FONT.DEFAULT
		];
	}

	public	ft_getSizes(): Coord[] {
		let	texts: string[][] = [];
		this.ascii_fonts.forEach((ascii_art: e_ASCII_ART_FONT) => {
			texts.push(NumbersAsciiArt.ft_getAsciiArtDigits(ascii_art)[0]);
		});
		this.ft_setTextFont(texts);
		return (super.ft_getSizes());
	}

	public	ft_selectAsciiFonts(font: e_LABEL_SIZE): void {
		const	ascii_font = this.ascii_fonts[font];
		if (ascii_font !== undefined) {
			this.ascii_digits = NumbersAsciiArt.ft_getAsciiArtDigits(ascii_font);
			this.ascii_art_length = NumbersAsciiArt.ft_getAsciiArtFontLength(ascii_font);
			return ;
		}
		this.ascii_digits = NumbersAsciiArt.ft_getAsciiArtDigits(e_ASCII_ART_FONT.DEFAULT);
		this.ascii_art_length = NumbersAsciiArt.ft_getAsciiArtFontLength(e_ASCII_ART_FONT.DEFAULT);
	}

	public ft_setFont(font: e_LABEL_SIZE): LabelFonted {
	    super.ft_setFont(font);
		this.ft_selectAsciiFonts(font);
		return (this);
	}

	private	ft_setMediumOrLargeFonts(counter: number): string[] {
		let	digits: number[] = [];
		if (counter === 0)
			digits.push(0);
		else
			while (counter > 0) {
				digits.push(counter % 10);
				counter = Math.floor(counter / 10);
			}
		let	counter_transposed_tmp: string[][] = [];
		let	counter_transposed: string[] = [];
		let	ascii_art_length_tmp = this.ascii_art_length;
		while(ascii_art_length_tmp--)
			counter_transposed_tmp.push([]);
		for (let index = digits.length - 1; index >= 0; index--) {
			this.ascii_digits[digits[index]].forEach((chunk: string, index: number) => {
				counter_transposed_tmp[index].push(chunk);
			});
		}
		counter_transposed_tmp.forEach((row: string[], index: number) => {
			counter_transposed[index] = row.join("");
		});
		return (counter_transposed);
	}

	public	ft_setCounter(counter: number): void {
		let	text: string[];
		switch (this.font) {
			case e_LABEL_SIZE.SMALL:
				text = [counter.toString()];
				break ;
			default:
				text = this.ft_setMediumOrLargeFonts(counter);
		}
		this.ft_changeTextFromArray(text);
	}
}
