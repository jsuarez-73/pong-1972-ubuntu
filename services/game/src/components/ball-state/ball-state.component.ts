import { PARAMS } from "@components/params/params.component";

export	class	BallState {
	
	private	pos_x: number;
	private	pos_y: number;
	private	pos_y_backup: number;
	private	pos_x_backup: number;
	public	vel_x: number = PARAMS.vel_x;
	public	vel_y: number = PARAMS.vel_y;
	private	time_step: number = PARAMS.time_step;

	constructor (pos_x: number, pos_y: number, params?: {vel_x: number, vel_y: number, t: number}) {
		this.pos_x = pos_x;
		this.pos_x_backup = this.pos_x;
		this.pos_y = pos_y;
		this.pos_y_backup = pos_y;
		if (params) {
			if (params.vel_x)
				this.vel_x = params.vel_x;
			if(params.vel_y)
				this.vel_y = params.vel_y;
			if (params.t)
				this.time_step = params.t;
		}
	}

	public	ft_nextBallState() : void {
		this.pos_x = this.pos_x + this.vel_x * this.time_step;
		this.pos_y = this.pos_y + this.vel_y * this.time_step;
	}

	public	ft_getBallState() : TBallState {
		return ({
			pos_x: this.pos_x,
			pos_y: this.pos_y,
			vel_x: this.vel_x,
			vel_y: this.vel_y
		});
	}

	public	ft_resetInitialState(): void {
		this.pos_x = this.pos_x_backup;
		this.pos_y = (2 * Math.random() - 1) * this.pos_y_backup;
	}
}
