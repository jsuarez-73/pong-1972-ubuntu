import {
  afterNextRender,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
  ViewChild,
  WritableSignal} from '@angular/core';
import {
  GameCourtEnum,
  GameStateEnum,
  GameTypeMessageEnum,
  PlayerActionEnum,
  PlayerSideEnum,
  PlayerStateEnum,
  ScaleEnum,
  TagPlayerEnum} from './constants/game-enum';
import { GameSocketService } from './services/game-socket-service';
import { isPlatformBrowser } from '@angular/common';
import {
  ErrorResponseMessage,
  GameMessage,
  NotificationMessage,
  NotificationPayload,
  StateRequestMessage,
  StateResponseMessage,
  StatusRequestMessage } from './interfaces/game-message';
import { CourtService } from './services/court-service';
import { GameMessageService } from './services/game-message-service';
import { GameCourt } from './interfaces/game-court';

@Component({
  selector: 'app-game',
  imports: [],
  templateUrl: './game.html',
  styleUrl: './game.css'
})

export class Game implements OnDestroy {

  @ViewChild('pongCourt') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  private gc: GameCourt = {
    width: GameCourtEnum.COURT_WIDTH,
    height: GameCourtEnum.COURT_HEIGHT,
    paddleH: GameCourtEnum.PADDLE_HEIGHT,
    paddleW: GameCourtEnum.PADDLE_THICKNESS,
    ballD: GameCourtEnum.BALL,
    ballR: GameCourtEnum.BALL / 2,
    counter: 0
  };

  iPlayer: TagPlayerEnum = TagPlayerEnum.UNKNOWN;
  oPlayer: TagPlayerEnum = TagPlayerEnum.UNKNOWN;
  iSide: PlayerSideEnum = PlayerSideEnum.UNKNOWN;
  oSide: PlayerSideEnum = PlayerSideEnum.UNKNOWN;
  nicknameLeft: WritableSignal<string> = signal('nickname L');
  nicknameRight: WritableSignal<string> = signal('nickname R');
  playersIdentified: boolean = false;

  previousGameState: GameStateEnum = GameStateEnum.UNKNOWN;
  gameState: GameStateEnum = GameStateEnum.UNKNOWN;



  constructor (
    @Inject(PLATFORM_ID) private platformId: Object,
    private gameSocket: GameSocketService,
    private ballBoy: CourtService,
    private chairUmpire: GameMessageService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Pong Game constructor');
      afterNextRender(() => {
        const canvasCourt = this.canvasRef.nativeElement;
        this.ctx = canvasCourt.getContext('2d')!; // [!NOTE] get the 2D rendering getContext
        this.ballBoy.ft_setContex(this.ctx);
        this.ballBoy.ft_setCourt(this.gc);
        this.ft_init();
      });
    }
  }

  ft_init(): void {
    this.ballBoy.ft_drawCourtSetup();
    this.gameSocket.ft_connect('wss://segfaultx.com/game/v1/game/207');
    /* [!WARNING] We need to know i the socket is connected/open
     * while (this.gameSocket.ft_isConnected()) {} does not work
     */
    this.gameSocket.ft_recieveMessage((message) => this.ft_handleGameMessage(message));
    /* [!WARNING] Do I need a variable to know the phase of the game to control
     * the key events
     * Will ngDestroy remove the event window???
     */
    window.addEventListener('keydown', (keyEvent: KeyboardEvent) => {
      this.ft_handleKeyPress(keyEvent);
    });

  }

  ft_setPlayerSide(playerSide: TagPlayerEnum): void {
    if (playerSide === TagPlayerEnum.ONE) {
      this.iPlayer = TagPlayerEnum.ONE;
      this.oPlayer = TagPlayerEnum.TWO;
      this.iSide = PlayerSideEnum.LEFT;
      this.oSide = PlayerSideEnum.RIGHT;
      this.nicknameLeft.set('Soy zurdo');
    } else if (playerSide === TagPlayerEnum.TWO) {
      this.iPlayer = TagPlayerEnum.TWO;
      this.oPlayer = TagPlayerEnum.ONE;
      this.iSide = PlayerSideEnum.RIGHT;
      this.oSide = PlayerSideEnum.LEFT;
      this.nicknameRight.set('Soy diestro');
    }
    this.playersIdentified = true;
  }

  ft_isDefined<T>(value: T | undefined): value is T {
    return value !== undefined;
  }

  /*** HANDLE MESSAGE *********************************************************/
  ft_handleGameMessage(message: GameMessage): void {
    switch (message.type) {
      case GameTypeMessageEnum.STATE_REQUEST:
        this.ft_handleStateRequestMessage(message as StateRequestMessage);
        break;

      case GameTypeMessageEnum.STATUS_REQUEST:
        this.ft_handleStatusRequestMessage(message as StatusRequestMessage);
        break;

      case GameTypeMessageEnum.STATE_RESPONSE:
        this.ft_handleStateResponseMessage(message as StateResponseMessage);
        break;

      case GameTypeMessageEnum.NOTIFICATION:
        this.ft_handleNotificationMessage(message as NotificationMessage);
        break;

      case GameTypeMessageEnum.ERROR_RESPONSE:
        this.ft_handleErrorResponseMessage(message as ErrorResponseMessage);
        break;

      case GameTypeMessageEnum.CLOSE_REQUEST:
        this.ft_handleCloseRequestMessage(message);
        break;

      case GameTypeMessageEnum.UNDEFINED:
        this.ft_handleUndefinedMessage(message);
        break;

      default:
        console.error("Default case: GameMessage");
        break;
    }
  }

  /*** HANDLE MESSAGE StateRequest ********************************************/
  ft_handleStateRequestMessage(message: StateRequestMessage): void {
    console.log("STATE_REQUEST = 0");
    console.log(message);
  }

  /*** HANDLE MESSAGE StatusRequest *******************************************/
  ft_handleStatusRequestMessage(message: StatusRequestMessage): void {
    console.log("STATE_REQUEST = 1");
    console.log(message);
  }

  /*** HANDLE MESSAGE StateResponse *******************************************/
  ft_handleStateResponseMessage(message: StateResponseMessage): void {
    console.log("STATE_RESPONSE = 2");
    this.ft_playGame(message);
  }

  ft_playGame(message: StateResponseMessage): void {
    this.ft_transformCoordMessage(message);

    const { ball, players } = message.body;

    this.ballBoy.ft_clearCourt();
    this.ballBoy.ft_drawNet();
    this.ballBoy.ft_drawBall(ball.pos_x, ball.pos_y);

    // subtract half racquet to get the point where we should start painting
    this.ballBoy.ft_drawLeftPaddle(players[0].pos_y - (GameCourtEnum.PADDLE_HEIGHT / 2));
    this.ballBoy.ft_drawRightPaddle(players[1].pos_y - (GameCourtEnum.PADDLE_HEIGHT / 2));

    this.ballBoy.ft_drawLeftScore(players[0].score);
    this.ballBoy.ft_drawRightScore(players[1].score);
  }

  /* [!NOTE] This function tranforms coord data
   */
  ft_transformCoordMessage(message: GameMessage): void {
    /* ball coord */
    message.body.ball.pos_x = (message.body.ball.pos_x * ScaleEnum.X)
      + (GameCourtEnum.COURT_WIDTH / 2);

    message.body.ball.pos_y = (GameCourtEnum.COURT_HEIGHT / 2)
      - (message.body.ball.pos_y * ScaleEnum.Y);

    /* paddle left coord */
    message.body.players[0].pos_y = (GameCourtEnum.COURT_HEIGHT / 2)
      - (message.body.players[0].pos_y * ScaleEnum.Y);

    /* paddle right coord */
    message.body.players[1].pos_y = (GameCourtEnum.COURT_HEIGHT / 2)
      - (message.body.players[1].pos_y * ScaleEnum.Y);
  }

  /*** HANDLE MESSAGE Notification ********************************************/
  ft_handleNotificationMessage(message: NotificationMessage): void {
    console.log("NOTIFICATION = 3");
    if (!this.playersIdentified && message.tag !== undefined) {
      this.ft_setPlayerSide(message.tag);
    }
    this.ft_updateGameState(message.body.status);

    switch (this.gameState) {
      case GameStateEnum.START:
        this.ft_startGameState(message);
        break;

      case GameStateEnum.COUNTDOWN:
        this.ft_countdownGameState(message);
        break;

      case GameStateEnum.READY:
        this.ft_readyGameState(message);
        break;

      case GameStateEnum.FINISH:
        this.ft_finishGameState(message);
        break;

      case GameStateEnum.UNKNOWN:
        this.ft_unknownGameState(message);
        break;

      default:
        console.error("Default case: NotificationMessage");
        break;
    }
  }

  ft_updateGameState(notificationGameState: GameStateEnum): void {
    if (this.gameState != notificationGameState) {
      this.previousGameState = this.gameState
      this.gameState = notificationGameState;
    } else {
      this.gameState = notificationGameState;
    }
  }

  /* [!NOTE] This state refers to when both players sockets are connected.
   */
  ft_startGameState(message: NotificationMessage): void {
    console.log("START");
    if (message.body.payload.counter !== undefined && message.tag !== undefined) {
      const counter = message.body.payload.counter;
      this.ballBoy.ft_clearCourt();
      this.ballBoy.ft_drawNet();
      if (message.tag === TagPlayerEnum.ONE) { // Case iPlayer is left P1
        if (message.body.payload.p1 === PlayerStateEnum.WAIT) {
          this.ballBoy.ft_drawHowToPlay(this.iSide);
        } else if (message.body.payload.p1 === PlayerStateEnum.READY) {
          this.ballBoy.ft_drawReadyToPlay(this.iSide);
        }

        if (message.body.payload.p2 === PlayerStateEnum.WAIT) {
          this.ballBoy.ft_drawWaitOtherPlayer(counter, this.oSide);
        } else if (message.body.payload.p2 === PlayerStateEnum.READY) {
          this.ballBoy.ft_drawOtherPlayerReady(counter, this.oSide);
        }

      }
      if (message.tag === TagPlayerEnum.TWO) { // Case iPlayer is right P2
        if (message.body.payload.p2 === PlayerStateEnum.WAIT) {
          this.ballBoy.ft_drawHowToPlay(this.iSide);
        } else if (message.body.payload.p2 === PlayerStateEnum.READY) {
          this.ballBoy.ft_drawReadyToPlay(this.iSide);
        }

        if (message.body.payload.p1 === PlayerStateEnum.WAIT) {
          this.ballBoy.ft_drawWaitOtherPlayer(counter, this.oSide);
        } else if (message.body.payload.p1 === PlayerStateEnum.READY) {
          this.ballBoy.ft_drawOtherPlayerReady(counter, this.oSide);
        }
      }
    }
  }

  /* [!NOTE] This state happens since both PlayerStateEnum are READY 3 2 1
   */
  ft_countdownGameState(message: NotificationMessage): void {
    console.log("COUNTDOWN");
    if (!message.body.payload.countdown_finish && message.body.payload.counter !== undefined) {
      this.ballBoy.ft_drawCountdown(message.body.payload.counter);
    } else if (message.body.payload.countdown_finish && message.body.payload.counter !== undefined) {
      this.ballBoy.ft_clearCourt();
      this.ballBoy.ft_drawNet();
      this.ballBoy.ft_drawWaitOtherPlayerPoop(message.body.payload.counter, this.oSide);
    }
  }

  /* [!NOTE] This state happens during the match when the other connection poop
   */
  ft_readyGameState(message: NotificationMessage): void {
    console.log("READY");
    if (message.body.payload.countdown_finish && message.body.payload.counter !== undefined) {
      this.ballBoy.ft_drawWaitOtherPlayerPoop(message.body.payload.counter, this.oSide);
    }
  }

  /* [!NOTE] This state is the end of the match
   */
  ft_finishGameState(message: NotificationMessage): void {
    console.log("FINISH");
    console.log(message); // -----------------------------------------------XXX
    if (message.body.payload.winner !== undefined) {
      if (message.body.payload.winner == this.iPlayer) {
        this.ballBoy.ft_drawWinner(this.iSide);
      } else if (message.body.payload.winner == this.oPlayer) {
        this.ballBoy.ft_drawWinner(this.oSide);
      }
    }
    if (message.body.payload.losers !== undefined) {
      if (message.body.payload.losers.length == 2) {
        this.ballBoy.ft_drawLoser(this.iSide);
        this.ballBoy.ft_drawLoser(this.oSide);
      } else if (message.body.payload.losers[0] == this.iPlayer) {
        this.ballBoy.ft_drawLoser(this.iSide);
      } else if (message.body.payload.losers[0] == this.oPlayer) {
        this.ballBoy.ft_drawLoser(this.oSide);
      }
    }
  }

  /* [!NOTE] This state refers to when only one socket is connected and is waiting
   * for the other player to start.
   */
  ft_unknownGameState(message: NotificationMessage): void {
    console.log("UNKNOWN");
    if (message.body.payload.counter !== undefined) {
      this.ballBoy.ft_drawWaitOtherConnection(message.body.payload.counter);
    }
  }


  /*** HANDLE MESSAGE ErrorResponse *******************************************/
  ft_handleErrorResponseMessage(message: ErrorResponseMessage): void {
    console.log("ERROR_RESPONSE = 4");
    console.log(message);
  }

  /*** HANDLE MESSAGE CloseRequest ********************************************/
  /* [!PENDING] Todo as server service game
   */
  ft_handleCloseRequestMessage(message: GameMessage): void {
    console.log("CLOSE_REQUEST = 5");
    console.log(message);
  }

  /*** HANDLE MESSAGE Undefined ***********************************************/
  /* [!PENDING] Todo as server service game
   */
  ft_handleUndefinedMessage(message: GameMessage): void {
    console.log("UNDEFINED = 6");
    console.log(message);
  }

  /*** KEY EVENTS **********************************************************/
  ft_handleKeyPress(keyEvent: KeyboardEvent): void {
    switch (keyEvent.key) {
      case 'Enter':
        console.log('Enter, gameStateEnum-> ', this.gameState);
        if (this.gameState === GameStateEnum.START)
          this.ft_sendStatusRequestMessage(PlayerStateEnum.READY);
        break;

      case 'w':
        if (this.gameState === GameStateEnum.READY)
          this.ft_sendStateRequestMessage(PlayerActionEnum.UP);
        break;

      case 's':
        if (this.gameState === GameStateEnum.READY)
          this.ft_sendStateRequestMessage(PlayerActionEnum.DOWN);
        break;

      case 'ArrowUp':
        if (this.gameState === GameStateEnum.READY)
          this.ft_sendStateRequestMessage(PlayerActionEnum.UP);
        break;

      case 'ArrowDown':
        if (this.gameState === GameStateEnum.READY)
          this.ft_sendStateRequestMessage(PlayerActionEnum.DOWN);
        break;

      default:
        break;
    }
  }

  ft_sendStatusRequestMessage(statusUpdate: PlayerStateEnum): void {
    const sms: StatusRequestMessage = {
      type: GameTypeMessageEnum.STATUS_REQUEST,
      body: {
        status: statusUpdate
      }
    };
    this.gameSocket.ft_sendMessage(sms as GameMessage);
  }

  ft_sendStateRequestMessage(actionPlayer: PlayerActionEnum) {
    const sms: StateRequestMessage = {
      type: GameTypeMessageEnum.STATE_REQUEST,
      body: {
        player: {
          action: actionPlayer
        }
      }
    };
    this.gameSocket.ft_sendMessage(sms as GameMessage);
  }

  /*** DESTRUCTOR *************************************************************/
  ngOnDestroy(): void {
      console.log('Closing/destroy game socket');
      this.gameSocket.ft_close();
      //window.removeEventListener('keydown', this.ft_handleKeyPress.bind(this));
  }
}
