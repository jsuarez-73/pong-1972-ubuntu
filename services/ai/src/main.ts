import { Trainer } from "./components/trainer/trainer";

function ft_main() {
	const	trainer = new Trainer({
		epsilon_init: 0.5,
		epsilon_final: 0.01,
		epsilon_decay_frames: 1e4,
		learning_rate: 1e-3,
		replay_buffer_size: 1e3,
	});
	trainer.ft_train();
}

ft_main();
