import random
from typing import List, Optional
from src_py.types.t_game import ReplayMemoryItem

class ReplayMemory:
    def __init__(self, max_len: int):
        self._max_len = max_len
        self.buffer: List[Optional[ReplayMemoryItem]] = [None for _ in range(max_len)]
        self.buffer_index: List[int] = list(range(max_len))
        self.length = 0
        self.index = 0

    @property
    def max_len(self) -> int:
        return self._max_len

    @property
    def appended(self) -> int:
        return self.length

    def ft_append(self, item: ReplayMemoryItem):
        self.buffer[self.index] = item
        self.length = min(self.length + 1, self._max_len)
        self.index = (self.index + 1) % self._max_len

    def ft_sample(self, batch_size: int) -> List[ReplayMemoryItem]:
        if batch_size > self._max_len:
            raise ValueError(f"batchSize ({batch_size}) exceeds buffer length ({self._max_len})")
        random.shuffle(self.buffer_index)
        out: List[ReplayMemoryItem] = []
        i = 0
        while len(out) < batch_size and i < len(self.buffer_index):
            item = self.buffer[self.buffer_index[i]]
            if item is not None:
                out.append(item)
            i += 1
        return out
