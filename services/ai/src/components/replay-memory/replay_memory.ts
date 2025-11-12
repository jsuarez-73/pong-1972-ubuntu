import { ReplayMemoryItem } from '@core/types/t_game';
import * as Tf from '@tensorflow/tfjs';
 
export class ReplayMemory {
	
	private	_max_len: number;
	private	buffer: (ReplayMemoryItem | null)[] = new Array();
	private	buffer_index: number[] = new Array();
	private	length: number = 0;
	private	index: number = 0;

	public	get	max_len() {return (this._max_len)}
	public	get	appended() {return (this.length)}

	constructor (max_len: number) {
		this._max_len = max_len;
		for (let i = 0; i < this._max_len; ++i) {
			this.buffer.push(null);
			this.buffer_index.push(i);
		}
	}

	ft_append(item: ReplayMemoryItem) {
		this.buffer[this.index] = item;
		this.length = Math.min(this.length + 1, this._max_len);
		this.index = (this.index + 1) % this._max_len;
	}

	ft_sample(batch_size: number): ReplayMemoryItem[] {
		if (batch_size > this._max_len) {
		  throw new Error(
			  `batchSize (${batch_size}) exceeds buffer length (${this._max_len})`);
		}
		Tf.util.shuffle(this.buffer_index);

		const out: ReplayMemoryItem[] = [];
		for (let i = 0; i < batch_size; ++i) {
			const	rp_item = this.buffer[this.buffer_index[i]!];
			if (rp_item != undefined && rp_item != null)
				out.push(rp_item);
		}
		return out;
	}
}
