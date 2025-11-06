import { Injectable } from '@angular/core';
import { WebsocketService } from '../../core/services/websocket-service';
import { GameMessage } from '../interfaces/game-message';

@Injectable({
  providedIn: 'root'
})

export class GameSocketService {

  constructor(private ws: WebsocketService) { }

  ft_connect(url: string): WebSocket | undefined {
    return this.ws.ft_connect(url);
  }

  get instance(): WebSocket | undefined {
    return this.ws.instance;
  }

  ft_close(): void {
    this.ws.ft_close();
  }

  /* [!NOTE] callback is a ft_function
   */
  ft_recieveMessage(callback: (message: GameMessage) => void): void {
    this.instance?.addEventListener('message', (event) => {
      try {
        const data: GameMessage = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('ERROR -> ', error);
      }
    });
  }

  /* [!NOTE] Partial<T> is a TypeScript type that makes all GameMessage
   * properties optional.
   */
  ft_sendMessage(message: Partial<GameMessage>): void {
    if (this.instance && this.instance.readyState === WebSocket.OPEN) {
      this.instance.send(JSON.stringify(message))
    }
  }
}
