import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/* [!NOTE] Injectable is a decorator that allow to use the class in other
 * components or services.
 * [!NOTE] Inject + PLATFORM_ID allow us where the code is execute, if is
 * client (browser) or server (SSR).
 * [!NOTE] isPlatformBrowser, function that returns TRUE if is running in the
 * browser, useful to avoid erros when using browser APIs.
 */

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket?: WebSocket; // [!NOTE] need to put ? for undefined.

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ft_connect(url: string): WebSocket | undefined {
    if (isPlatformBrowser(this.platformId)) {
      this.socket = new WebSocket(url);
      return this.socket;
    }
    return undefined;
  }

  get instance(): WebSocket | undefined {
    return this.socket;
  }

  ft_close(): void {
    //(this.socket) ? this.socket.close() : console.log('No socket to close');
    this.socket?.close();
  }
}
