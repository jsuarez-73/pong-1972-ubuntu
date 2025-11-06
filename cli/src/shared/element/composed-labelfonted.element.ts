import { e_LABEL_SIZE } from "@cli-types/enums";
import { LabelFonted } from "@shared/element/label-fonted.element";
import { ComposedElement } from "./composed.element";

export class	ComposedLabelFontedElement<T extends LabelFonted> extends ComposedElement<T> {

	protected	font_set: e_LABEL_SIZE = e_LABEL_SIZE.SMALL;

	constructor (label_elements?: T[]) {
		super(label_elements);
	}

	public	ft_setFont(font: e_LABEL_SIZE): void {
		this.font_set = font;
		this.elements.forEach((label_font: LabelFonted) => {
			label_font.ft_setFont(font);
		});
		this.ft_arrangeElements();
	}

	public	ft_getGroupSizeByFont(font: e_LABEL_SIZE): Coord {
		this.elements.forEach((label: T) => {
			label.ft_changeText(font);	
		});
		this.ft_arrangeElements();
		return (this.ft_getGroupSize());
	}

	public	ft_getSizes(): Coord[] {
		let	sizes: Coord[] = [];
		sizes.push(this.ft_getGroupSizeByFont(e_LABEL_SIZE.LARGE));
		sizes.push(this.ft_getGroupSizeByFont(e_LABEL_SIZE.MEDIUM));
		sizes.push(this.ft_getGroupSizeByFont(e_LABEL_SIZE.SMALL));
		return (sizes);
	}

	public	ft_getFont(): e_LABEL_SIZE {
		return (this.font_set);
	}

}
