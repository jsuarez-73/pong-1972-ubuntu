import { Injectable } from '@angular/core';
import { ColorPaletteEnum } from '../constants/game-enum';
import { GameCourt, KeyControl } from '../interfaces/game-court';
import { warn } from 'console';

@Injectable({
  providedIn: 'root'
})
export class CourtService {

  private ctx!: CanvasRenderingContext2D;
  private court!: GameCourt;

  constructor() { }

  ft_setContex(ctx: CanvasRenderingContext2D): void {
    this.ctx = ctx;
  }

  ft_setCourt(gc: GameCourt): void {
    this.court = gc;
  }

  /*** DRAW *******************************************************************/

  ft_clearCourt(): void {
    this.ctx.clearRect(0, 0, this.court.width, this.court.height);
  }

  ft_drawCourtSetup() {
    this.ft_clearCourt();
    this.ft_drawNet();
    this.ft_drawBall(this.court.width / 2, 75);

    this.ft_drawLeftPaddle(300);
    this.ft_drawLeftScore(0);

    this.ft_drawRightPaddle(300);
    this.ft_drawRightScore(0);
  }

  ft_drawNet(): void {
    this.ctx.strokeStyle = ColorPaletteEnum.WHITE;
    this.ctx.setLineDash([6, 6]); // [dashLength, gapLength]
    this.ctx.beginPath();
    this.ctx.moveTo(this.court.width / 2, 0); // start in the middle top
    this.ctx.lineTo(this.court.width / 2, this.court.height); // draw downward
    this.ctx.stroke();
  }

  ft_drawBall(pos_x: number, pos_y: number): void {
    this.ctx.beginPath();
    this.ctx.arc(pos_x, pos_y, this.court.ballD / 2, 0, 2 * Math.PI);
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.fill();
  }

  ft_drawLeftPaddle(pos_y: number): void {
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.fillRect(0, pos_y, this.court.paddleW, this.court.paddleH);
  }

  ft_drawRightPaddle(pos_y: number): void {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(this.court.width - this.court.paddleW, pos_y, this.court.paddleW, this.court.paddleH);
  }

  ft_drawLeftScore(score: number): void {
    this.ctx.font = '60px "DotGothic16"';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.fillText(`${score}`, (this.court.width / 2) - 73, 60);
  }

  ft_drawRightScore(score: number): void {
    this.ctx.font = '60px "DotGothic16"';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.fillText(`${score}`, (this.court.width / 2) + 73, 60);
  }

  ft_drawWinner(playerSide: number): void {
    const courtSide: number = (!playerSide) ? this.court.width * 0.25 : this.court.width * 0.75;
    this.ctx.font = '73px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('WINNER', courtSide, 250);
  }

  ft_drawLoser(playerSide: number): void {
    const courtSide: number = (!playerSide) ? this.court.width * 0.25 : this.court.width * 0.75;
    this.ctx.font = '73px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    //this.ctx.fillText('LOSER', (this.court.width / 2) + 200, 250);
    this.ctx.fillText('LOSER', courtSide, 250);
  }

  /* [!NOTE] This ft draw the case Notification.Unknow
   */
  ft_drawWaitOtherConnection(counter: number): void {
    this.court.counter = counter;
    this.ft_clearCourt();
    this.ctx.font = '30px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('We are preparing the court.', (this.court.width / 2), 100);

    this.ctx.font = '30px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Wait for the other player to join...', (this.court.width / 2), 150);

    this.ctx.font = '50px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${this.court.counter}`, (this.court.width / 2), 250);
  }

  /* [!NOTE] oPlayerSide 0-> 0.25 left || 1-> 0.75 right
   */
  ft_drawWaitOtherPlayer(counter: number, oPlayerSide: number) {
    const courtSide: number = (!oPlayerSide) ? this.court.width * 0.25 : this.court.width * 0.75;
    this.ctx.font = '20px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('The other player has joined.', courtSide, 200);

    this.ctx.font = '20px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Waiting for them to be ready...', courtSide, 250);

    this.ctx.font = '60px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${counter}`, this.court.width / 2, 400);
  }

  /* [!NOTE] playerSide 0-> 0.25 left || 1-> 0.75 right
   */
  ft_drawHowToPlay(playerSide: number): void {
    const courtSide: number = (!playerSide) ? this.court.width * 0.25 : this.court.width * 0.75;
    this.ctx.font = '30px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PLAYER CONTROLS', (courtSide), 50);

    const xLeftActionText: number = (courtSide) + 20;
    const xLeftKeyText: number = xLeftActionText - 100;

    const upKey: KeyControl = {
      xTextKey: xLeftKeyText,
      xActionText: xLeftActionText,
      yText: 140,
      text: 'W',
      actionText: 'Move up',
      wBox: 50,
      hBox: 50,
      rBox: 5,
      hAlignBox: 35 // Is the closest coord for aligning the box vertically with the text
    };
    this.ft_drawKeyBox(upKey);

    const downKey: KeyControl = {
      xTextKey: xLeftKeyText,
      xActionText: xLeftActionText,
      yText: 220,
      text: 'S',
      actionText: 'Move down',
      wBox: 50,
      hBox: 50,
      rBox: 5,
      hAlignBox: 35 // Is the closest coord for aligning the box vertically with the text
    };
    this.ft_drawKeyBox(downKey);

    const enterKey: KeyControl = {
      xTextKey: xLeftKeyText,
      xActionText: xLeftActionText,
      yText: 300,
      text: 'ENTER',
      actionText: 'I\'m ready',
      wBox: 80,
      hBox: 50,
      rBox: 5,
      hAlignBox: 35 // Is the closest coord for aligning the box vertically with the text
    };
    this.ft_drawKeyBox(enterKey);
  }

  /* [!NOTE] Use this ft always above fill() due to the true case,
   * false case is necessary to reset and to affect the other drawings
   */
  ft_drawKeyBoxShadow(shadow: boolean): void {
    if (shadow) {
      this.ctx.shadowColor = ColorPaletteEnum.BROWN;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
      this.ctx.shadowBlur = 8;
    } else {
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
      this.ctx.shadowBlur = 0;
    }
  }

  ft_drawKeyBox(key: KeyControl): void {
    const xBox: number =  key.xTextKey - (key.wBox / 2);
    const yBox: number = key.yText - key.hAlignBox;

    this.ctx.beginPath();
    this.ctx.fillStyle = ColorPaletteEnum.BROWN;
    this.ctx.roundRect(xBox, yBox, key.wBox, key.hBox, key.rBox);
    this.ft_drawKeyBoxShadow(true);
    this.ctx.fill();
    this.ctx.closePath();
    this.ft_drawKeyBoxShadow(false);

    this.ctx.font = '24px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${key.text}`, key.xTextKey, key.yText);

    this.ctx.font = '20px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${key.actionText}`, key.xActionText, key.yText);
  }

  /* [!NOTE] playerSide 0-> 0.25 left || 1-> 0.75 right
   */
  ft_drawReadyToPlay(playerSide: number): void {
    const courtSide: number = (!playerSide) ? this.court.width * 0.25 : this.court.width * 0.75;
    this.ctx.font = '20px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('You\'re ready to play...', courtSide, 150);
  }

  /* [!NOTE] oPlayerSide 0-> 0.25 left || 1-> 0.75 right
   */
  ft_drawOtherPlayerReady(counter: number, otherPlayerSide: number): void {
    const courtSide: number = (!otherPlayerSide) ? this.court.width * 0.25 : this.court.width * 0.75;
    this.ctx.font = '20px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.TANGARINE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('The other player is ready.', courtSide, 200);

    this.ctx.font = '20px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Waiting for you to be ready...', courtSide, 250);

    this.ctx.font = '60px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${counter}`, this.court.width / 2, 400);
  }

  ft_drawCountdown(counter: number): void {
    this.court.counter = counter;
    this.ft_clearCourt();
    this.ft_drawNet();

    if (this.court.counter) {
      this.ctx.font = '120px "DotGothic16"';
      this.ctx.fillStyle = ColorPaletteEnum.WHITE;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${this.court.counter}`, (this.court.width / 2), 250);
    } else {
      this.ft_drawGo();
    }
  }

  ft_drawGo(): void {
    this.ft_clearCourt();
    this.ft_drawNet();

    this.ctx.font = '120px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`GO`, (this.court.width / 2), 250);
  }

  /* [!NOTE] oPlayerSide 0-> 0.25 left || 1-> 0.75 right
   */
  ft_drawWaitOtherPlayerPoop(counter: number, otherPlayerSide: number): void {
    const courtSide: number = (!otherPlayerSide) ? this.court.width * 0.25 : this.court.width * 0.75;
    this.ctx.clearRect(courtSide - (320 / 2), 200 - 30, 320, 100);
    this.ctx.font = '20px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('The other player is pooping...', courtSide, 200);

    this.ctx.font = '20px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Wait and be ready.', courtSide, 250);

    this.ctx.clearRect((this.court.width / 2) - (70 / 2), 400 - 60, 70, 70);
    this.ctx.font = '60px "DotGothic16"';
    this.ctx.fillStyle = ColorPaletteEnum.WHITE;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${counter}`, this.court.width / 2, 400);
  }
}
