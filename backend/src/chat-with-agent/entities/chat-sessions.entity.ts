import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "chat_sessions" })
export class ChatSession {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  chatId: string;

  @Column({ default: true })
  aiEnabled: boolean;
}
