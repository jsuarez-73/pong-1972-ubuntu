export interface GameCourt {
  width: number;
  height: number;
  paddleH: number;
  paddleW: number;
  ballD: number;
  ballR: number;
  counter: number;
}

export interface KeyControl {
  xTextKey: number;
  xActionText: number;
  yText: number;
  text: string;
  actionText: string;
  wBox: number;
  hBox: number;
  rBox: number;
  hAlignBox: number;
}
