# run_trainer.py
from src_py.components.trainer.trainer import Trainer

if __name__ == "__main__":
    cfg = dict(
        epsilon_init=1.0,
        epsilon_final=5e-2,
        epsilon_decay_frames=1e6,
        replay_buffer_size=20_000,
        learning_rate=1e-4
    )
    trainer = Trainer(cfg)
    trainer.ft_train()

    # Keep process alive to receive WS messages
    import time
    while True:
        time.sleep(1)
