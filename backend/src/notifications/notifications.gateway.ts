import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: true },
  path: '/socket.io',
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  /** Emit stock alert to all connected clients. */
  emitStockAlert(payload: { productId: string; productName: string; sku: string; stockLevel: number; reorderPoint: number; message: string }) {
    if (this.server) {
      this.server.emit('stock-alert', payload);
    }
  }
}
