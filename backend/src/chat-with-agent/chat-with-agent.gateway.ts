import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { MarkReadDto } from './dto/chat-with-agent.dto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: "*" } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  // Join a chat thread room
  @SubscribeMessage('joinThread')
  handleJoinThread(@MessageBody() chatId: string, @ConnectedSocket() client: Socket) {
    console.log(`Client joining chat thread: ${chatId}`);
    client.join(chatId);
  }

  // Handle sending messages via socket
  @SubscribeMessage('sendMessage')
  handleSendMessage(@MessageBody() data: any) {
    this.server.to(data.chatId).emit('newMessage', data);
  }
}
