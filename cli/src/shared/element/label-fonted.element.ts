import { e_LABEL_SIZE } from "@cli-types/enums";
import { LabelElement } from "@shared/element/label.element";
import { ComposedLabelFontedElement } from "@shared/element/composed-labelfonted.element";

export class	LabelFonted extends LabelElement {

	protected	font: e_LABEL_SIZE = e_LABEL_SIZE.SMALL;
	protected	text_font: string[][] = [[]];
	
	constructor(config?: ConfigLabelFonted) {
		super({start: config?.start, style: config?.style, reset: config?.reset});
		this.font = config?.font ?? this.font;
		this.text_font = config?.texts ?? this.text_font;
	}

	public static	ft_selectFont(space_free: Coord, labels: LabelFontedMixed[]): e_LABEL_SIZE {
		space_free.x = (space_free.x < 0) ? 0 : space_free.x;
		space_free.y = (space_free.y < 0) ? 0 : space_free.y;
		let	font_tmp : e_LABEL_SIZE = e_LABEL_SIZE.LARGE;
		let	labels_sizes : Coord[][] = [];
		labels.forEach((label: LabelFonted | ComposedLabelFontedElement<LabelFonted>) => {
			labels_sizes.push(label.ft_getSizes())
		});
		labels_sizes.forEach((sizes: Coord[]) => {
			for (let font = e_LABEL_SIZE.LARGE; font <= e_LABEL_SIZE.SMALL; font++) {
				if (sizes[font].x < space_free.x && sizes[font].y < space_free.y) {
					if (font_tmp < font)
						font_tmp = font;
					break ;
				}
			}
		});
		return (font_tmp);
	}

	public ft_setTextFont(text_font: string[][]): LabelFonted {
		this.text_font = text_font;
		this.ft_changeText(this.font);
	    return (this);
	}

	public ft_setConfigFonted(config: ConfigLabelFonted): LabelFonted {
		super.ft_setConfig({start: config.start, style: config.style, reset: config.reset});
		if (config.texts !== undefined)
			this.ft_setTextFont(config.texts);
		if (config.font !== undefined)
			this.ft_setFont(config.font);
		return (this);
	}

	private	ft_assertFont(font: e_LABEL_SIZE): e_LABEL_SIZE {
		if (font < e_LABEL_SIZE.LARGE || font > e_LABEL_SIZE.SMALL)
			return (e_LABEL_SIZE.SMALL);	
		return (font);
	}

	public ft_setFont(font: e_LABEL_SIZE): LabelFonted {
		font = this.ft_assertFont(font);
		this.font = font;
		this.ft_changeText(this.font);
		return (this);
	}

	public	ft_getFont(): e_LABEL_SIZE {
		return (this.font);
	}

	public	ft_changeText(font: e_LABEL_SIZE): LabelFonted {
		if (this.text_font[font] !== undefined)
			this.ft_setTexts(this.text_font[font]);
		return (this);
	}

	public	ft_changeTextFromArray(text: string[]): LabelFonted {
		if (text !== undefined && text.length > 0)
			this.ft_setTexts(text);
		return (this);
	}

	public	ft_getSizeByFont(font: e_LABEL_SIZE): Coord {
		font = this.ft_assertFont(font);
		this.ft_changeText(font);	
		return (this.ft_getSize());
	}

	public	ft_getSizes(): Coord[] {
		let	sizes: Coord[] = [];
		sizes.push(this.ft_getSizeByFont(e_LABEL_SIZE.LARGE));
		sizes.push(this.ft_getSizeByFont(e_LABEL_SIZE.MEDIUM));
		sizes.push(this.ft_getSizeByFont(e_LABEL_SIZE.SMALL));
		return (sizes);
	}

}
