import { e_Colors, e_LABEL_SIZE } from "@cli-types/enums";
import { ModelLoginService } from "@services/model/model-login.service";
import { NodeTree, Tree } from "@segfaultx/container";
import { ComposedLabelFontedElement } from "@shared/element/composed-labelfonted.element";
import { ComposedElement } from "@shared/element/composed.element";
import { ViewElement } from "@shared/element/element";
import { LabelFonted } from "@shared/element/label-fonted.element";
import { LabelElement } from "@shared/element/label.element";
import { TextArea } from "@shared/element/textarea.element";
import { LoginTextFont } from "@shared/textfonts/login.textfont";
import { ViewModel } from "@viewmodel/viewmodel";
import { Provider } from "@services/provider/provider";

export class	Login extends ViewModel<ModelLoginService>{
	
	private	rect_user: TextArea;
	private	rect_pass: TextArea;
	private	user_label: LabelFonted = new LabelFonted({
		texts: LoginTextFont.labels.user_text
	});
	private	pass_label: LabelFonted = new LabelFonted({
		texts: LoginTextFont.labels.pass_text
	});
	private	pong_label: LabelFonted = new LabelFonted({
		texts: LoginTextFont.labels.pong
	});
	private	g_login: ComposedElement<ViewElement>;
	private	help_msg: LabelElement = new LabelElement(
		{
			start: {x: 0, y: this.sc_size.y - 3},
			style: {fg: e_Colors.FGH_RED}
		},
		"[ENTER]: Authenticate",
		"[TAB]: Move between tabs"
	)
	private	msg_auth: LabelElement = new LabelElement();

	constructor () {
		super(new ModelLoginService());
		const	size = (this.sc_size.x < 20 ? this.sc_size.x - 2 : 20);
		this.rect_user = new TextArea({size: {x: size, y: 2}});
		this.rect_pass = new TextArea({size: {x: size, y: 2}});
		this.ft_setFocusable(this.rect_user, this.rect_pass);
		super.ft_setParentElements({
			rect_user: this.rect_user,
			rect_pass: this.rect_pass,
			user_label: this.user_label,
			pass_label: this.pass_label,
			pong_label: this.pong_label,
			help_msg: this.help_msg,
			msg_atuh: this.msg_auth
		});
		this.g_login = new ComposedElement([
			this.rect_user,
			this.rect_pass,
			this.user_label,
			this.pass_label,
			this.pong_label,
			this.msg_auth
		]);
		this.ft_selectFont();
		this.ft_arrangeAllElements();
		this.ft_render();
	}

	private	ft_arrangeAllElements(): void {
		let	ul_start = this.sc_size.y - this.g_login.ft_getComposedSize().y;
		ul_start -= this.pong_label.ft_getEnd().y;
		ul_start = ul_start < 0 ? 1 : this.pong_label.ft_getEnd().y + ul_start / 2;
		this.g_login.ft_setArrangeConfig(new Tree<ArrangeConfig>(
			new NodeTree({
				value: {element: this.pong_label, start: {
					x: this.sc_size.x / 2 - this.pong_label.ft_getSize().x / 2,
					y: 1
				}},
				children: [
					new NodeTree({
					value: {element: this.user_label, start: {
						x: this.sc_size.x / 2 - this.rect_user.ft_getSize().x / 2,
						y: ul_start
					}},
					children: [
						new NodeTree({
						value: {element: this.rect_user, relative: {padding: 1}},
						children: [
							new NodeTree({
								value: {element: this.pass_label, relative: {padding: 1}},
								children: [
									new NodeTree({
									value: {element: this.rect_pass, relative: {padding: 1}},
									children: [
										new NodeTree({
											value: {element: this.msg_auth, relative: {padding: 1}}
										})
									]
								})]
						})]
					})]
			})]})
		));
		this.g_login.ft_arrangeElements();
	}
	
	private	ft_selectFont(): void {
		const	space = {
			x: this.sc_size.x,
			y: this.sc_size.y - this.rect_user.ft_getSize().y - this.rect_pass.ft_getSize().y - 4
		};
		const	arrange_fonted = new ComposedLabelFontedElement([
			this.user_label, this.pass_label, this.pong_label
		]);
		arrange_fonted.ft_setArrangeConfig(new Tree<ArrangeConfig>(
			new NodeTree({
				value: {element: this.pong_label, start: {x: this.sc_size.x / 2, y: 0}},
				children: [
					new NodeTree({
						value: {element: this.user_label, relative: {
							compute_padding: () => {
								let	size = this.sc_size.y / 2 - this.pong_label.ft_getSize().y; 
								 size -= this.user_label.ft_getSize().y / 2
								 return (size);
							}}},
						children: [
							new NodeTree({
								value: {element: this.pass_label, relative: {padding: 1}}
						})]
				})]
			}))
		);
		this.ft_setFontLabelsFonted(LabelFonted.ft_selectFont(space, [arrange_fonted]));
	}

	private	ft_setFontLabelsFonted(font: e_LABEL_SIZE): void {
		this.user_label.ft_setFont(font);
		this.pass_label.ft_setFont(font);
		this.pong_label.ft_setFont(font);
	}

	private	async	ft_verifyAuth(): Promise<boolean> {
		const	token = await this.model.ft_getToken({
			username: this.rect_user.ft_getText(),
			password: this.rect_pass.ft_getText()
		});
		if (token == undefined) {
			this.msg_auth.ft_setTexts(["Authentication KO"]).ft_setStyle({
				fg: e_Colors.FG_RED
			});
			return (false);
		}
		Provider.getInstance().set("token", token);
		return (true);
	}

	protected async ft_handleKeys(char: string, key: Key): Promise<void> {
		if (key.name === "tab" && ! key.ctrl)
			this.ft_moveFocusForward();
		else if (key.name === "return") {
			if (await this.ft_verifyAuth() === true) {
				this.router.ft_navigate("dashboard");
				return ;
			}
		}
		else
			this.ft_getFocused().ft_handleKeys(char, key);
		this.ft_render();
	}

}
