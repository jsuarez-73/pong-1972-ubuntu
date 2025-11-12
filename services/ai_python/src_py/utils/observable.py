from typing import Callable, Generic, TypeVar, List

T = TypeVar("T")

class Observer(Generic[T]):
    def __init__(self, fn: Callable[[T], None]):
        self._fn = fn
    def ft_update(self, value: T):
        self._fn(value)

class Subject(Generic[T]):
    def __init__(self):
        self._subs: List[Observer[T]] = []
    def ft_subscribe(self, ob: Observer[T]):
        self._subs.append(ob)
    def ft_notify(self, value: T):
        for ob in list(self._subs):
            ob.ft_update(value)
