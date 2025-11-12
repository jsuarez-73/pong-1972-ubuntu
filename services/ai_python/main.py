# run_trainer.py
from src_py.components.trainer.trainer import Trainer

if __name__ == "__main__":
    cfg = dict(
        epsilon_init=0.5,
        epsilon_final=0.01,
        epsilon_decay_frames=10_000,
        replay_buffer_size=1_000,
        learning_rate=1e-4
    )
    trainer = Trainer(cfg)
    trainer.ft_train()

    # Keep process alive to receive WS messages
    import time
    while True:
        time.sleep(1)
