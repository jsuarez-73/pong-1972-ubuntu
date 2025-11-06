interface	ModelService {
	[index: string]: any;
}

interface	CliCred {
	username: string,
	password: string
}

interface	FontedElement {
	public ft_getSizes(): Coord[];
}
type Constructor = new (...args: any[]) => {};
type	Subscription = { unsubscribe: Function };
type	Route = {
	path: string,
	viewmodel: ViewModel
};
type	Key = {
	ctrl: boolean,
	meta: boolean,
	shift: boolean,
	name: string
}

type	Listener = (...args: any[]) => void;

type	Coord = {
	x: number,
	y: number
}

type	StyleChars = {
	char_x: string,
	char_y: string
}

type	StyleColors = {
	bg: e_Colors,
	fg: e_Colors
}

type	ConfigLabelElement = {
	start?: Coord,
	style?: Partial<StyleColors>,
	reset?: e_Colors,
}

type	ConfigPad = {name: string, pads: number[]};

type	ArrangeConfig = {
	element: ViewElement,
	start?: Coord,
	relative?: {
		direction?: e_DIRECTION,
		padding?: number
		computed_padding?: () => number;
	}
};

type	ConfigLabelFonted = ConfigLabelElement & {
	font?: e_LABEL_SIZE,
	texts?: string[][]
};

type	ConfigGeometry = {
	start?: Coord,
	end?: Coord,
	size?: Coord,
};

type	RectangleConfig  = ConfigGeometry & {
	style?: StyleChars,
	colors?: {hl?: e_Colors, vl?: e_Colors}
}; 

type	HorizontalConfig = ConfigGeometry & {
	char?: string
	color?: e_Colors
};

type	VerticalConfig = HorizontalConfig;
type	RacquetConfig = ConfigGeometry;
type	ToogleConfig = {
	start?: Coord,
	highlight?: Partial<StyleColors>,
	config_rg?: ConfigLabelFonted,
	config_lf?: ConfigLabelFonted
};

type	RowConfig = {
	start?: Coord,
	pad?: number,
	elements?: ViewElement[]
}

type	ListConfig = {
	start?: Coord,
	highlight?: e_Colors,
	elements?: RowElement[],
	max_rows?: number
}

interface	EventImplementation {
	[index: string]: any
}

interface	EventElement {
	emitter: ViewElement,
	char: string,
	key: Key
	payload?: EventImplementation
};


interface	EventListElement extends EventImplementation {
	selected: RowElement | undefined,
	current: RowElement | undefined,
	before: RowElement | undefined
};

interface	EventToggleElement extends EventImplementation {
	is_accepted: boolean
}

type	SelectConfig = {
	start?: Coord,
	size?: Coord,
	end?: Coord,
	elements?: RowElement,
	highlight?: e_Colors,
	max_rows?: number
}

type	MatchUnit = {
	user: string,
	status: number
}

type	MatchResponse = {
	text: string,
	matchs: MatchUnit[]
}

type	ChallengeUnit = {
	user: string
}

type	ChallengeResponse = {
	challenges: ChallengeUnit[]
}

type	LabelFontedMixed = LabelFonted | ComposedLabelFontedElement<LabelFonted>;

interface	Context	{
	[index: string]: any;
}

type	ListChildren = {
	[index: string]: T extends ChildViewModel ? T : never;
}

type	ListChildrenConstructor = {
	[index: string]: new (...args: any[]) => ChildViewModel;
}

/*[!NOTE][!IMPORTANT]:
	* This means: for each property in ListElements must be a type which extends
	* the ViewElement class which in that case would be a constructor which returns
	* its type bounded by ViewElement or never in case the type doesn't extends 
	* ViewElement.*/
type	ListElements = {
	[index: string]: T extends ViewElement ? T : never;
}

/*Game Service Model*/

type	BallState = {pos_x: number, pos_y: number};
type	PlayerState = {
	score: number,
	pos_y: number,
	action: e_ACTION,
	tag: e_TAG_PLAYER
}
type	SocketRequest = {
	body: any,
	id: string,
	log: any,
	params: any,
	query: any,
	raw: IncomingMessage,
	ws: boolean
};

type	NotificationPayload = {
	p1: e_PLAYER_STATE,
	p2: e_PLAYER_STATE,
	countdown_finish: boolean,
	counter?: number,
	winner?: e_TAG_PLAYER,
	losers?: e_TAG_PLAYER[]
}

type	StateNotificationBody = {
	status: e_GAME_STATE,
};

type	StateRequestBody = { 
	player: {
		action: e_ACTION
	},
}

type	ErrorResponseBody = {
	code: e_ERROR_RESPONSE,
	msg: string
}

type	StateResponseBody = {
	ball: BallState,
	players: PlayerState[],
}

type	StatusRequestBody = {
	status: e_PLAYER_STATE
}

type	NotificationBody = {
	status: e_GAME_STATE,
	payload: NotificationPayload
}

interface	MessageGame {
	type: e_TYPE_MESSAGE,
	body: StateRequestBody |
		StateNotificationBody |
		ErrorResponseBody |
		StateResponseBody |
		StatusRequestBody |
		NotificationBody,
	tag: e_TAG_PLAYER
};

interface	StateNotificationMsg extends MessageGame {
	type: e_TYPE_MESSAGE.NOTIFICATION,
	body: StateNotificationBody
}

interface	StateRequestMsg extends MessageGame {
  type: e_TYPE_MESSAGE.STATE_REQUEST,
  body: StateRequestBody
}

interface	ErrorResponseMsg extends MessageGame {
	type: e_TYPE_MESSAGE.ERROR_RESPONSE,
	body: ErrorResponseBody
}

interface	StateResponseMsg extends MessageGame {
	type: e_TYPE_MESSAGE.STATE_RESPONSE,
	body: StateResponseBody
}

interface	StatusRequestMsg extends MessageGame {
	type: e_TYPE_MESSAGE.STATUS_REQUEST,
	body: StatusRequestBody
}

interface	NotificationMsg extends MessageGame {
	type: e_TYPE_MESSAGE.NOTIFICATION,
	body: NotificationBody
}

interface	SubjectEmitter<T> {
	public	ft_setEmitter(subject: Subject<T>): void;
}

interface	SubjectObserver<T> {
	public	ft_getObserver() : Observer<T>;
}

