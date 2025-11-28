import { Trainer } from "./components/trainer/trainer";

function ft_main() {
	const	trainer = new Trainer({
		epsilon_init: 1.0,
		epsilon_final: 5e-2,
		epsilon_decay_frames: 1e5,
		learning_rate: 1e-4,
		replay_buffer_size: 2e4,
	});
	trainer.ft_build_trainer().then((_res) => {
		trainer.ft_train();
	});
}

ft_main();
