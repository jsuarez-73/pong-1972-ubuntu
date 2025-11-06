import { ModelDashBoardService } from "@services/model/model-dashboard.service";
import { LabelElement } from "@shared/element/label.element";
import { VerticalLineElement } from "@shared/element/vertical-line.element";
import { ViewModel } from "@viewmodel/viewmodel";
import { DashBoardSeeker } from "./dashboard-seeker.viewmodel";
import { ChildViewModel } from "@viewmodel/child-viewmodel";
import { RowElement } from "@shared/element/row.element";
import { DashBoardChallenges } from "./dashboard-challenges.viewmodel";
import { e_Colors } from "@cli-types/enums";

export class	DashBoard extends ViewModel<ModelDashBoardService> {

	private	lb_seeker: RowElement = new RowElement({
		start: {x: 2, y: this.sc_size.y / 2 - 1},
		elements: [
		new LabelElement({}, "  Seeker  ".slice(0, this.sc_size.x / 4 - 4))
	]});
	private	lb_challenges: RowElement = new RowElement({
		start: {x: 2, y: this.sc_size.y / 2 + 2},
		elements: [
		new LabelElement({}, "Challenges".slice(0, this.sc_size.x / 4 - 4))
	]});
	private	vl_panel: VerticalLineElement = new VerticalLineElement({
		start: {x: this.sc_size.x / 4, y: 0},
		end: {x: this.sc_size.x / 4, y: this.sc_size.y - 1}
	});
	private	help_msg: LabelElement = new LabelElement(
		{
			start: {x: 0, y: this.sc_size.y - 5},
			style: {fg: e_Colors.FGH_RED}
		},
		"[ENTER]: Make a selection.",
		"[TAB]: Move between tabs.",
		"[ARROW UP]: Move up",
		"[ARROW_DOWN]: Move down"
	)

	constructor () {
		super(new ModelDashBoardService());
		super.ft_setParentElements({
			seeker: this.lb_seeker,
			challenges: this.lb_challenges,
			vl_panel: this.vl_panel,
			help_msg: this.help_msg
		});
		super.ft_setContext({
			ch_start: {x: Math.floor(this.sc_size.x / 4 + 2), y: 1},
			ch_size: {
				x: Math.floor(this.sc_size.x * 3 / 4 - 3),
				y: this.sc_size.y - this.help_msg.ft_getSize().y - 1 
			},
			sc_size: this.sc_size,
			model: this.model
		});
		super.ft_setChildren({
			seeker: DashBoardSeeker,
			challenges: DashBoardChallenges
		});
		this.ft_pushChildViewModel("seeker");
		super.ft_setFocusable(this.lb_seeker, this.lb_challenges);
		this.ft_render();
	}

	public ft_handleKeys(char: string, key: Key): void {
		this.ft_getChildrenOnView().forEach((child: ChildViewModel) => {
			child.ft_handleKeys(char, key);
		});
	    switch (key.name) {
			case "tab":
				this.ft_moveFocusForward();
				const	focused = this.ft_getFocused();
				if (focused === this.lb_seeker && ! this.ft_hasChildOnView("seeker")) {
					this.ft_popAllChildren();
					this.ft_pushChildViewModel("seeker");
				}
				else if (focused === this.lb_challenges && ! this.ft_hasChildOnView("challenges")) {
					this.ft_popAllChildren();
					this.ft_pushChildViewModel("challenges");
				}
				break ;
		}
		this.ft_render();
	}
}
