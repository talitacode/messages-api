import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { DynamoModule } from '../dynamodb/dynamodb.module'; 

@Module({
  imports: [DynamoModule],
  providers: [MessagesService],
  controllers: [MessagesController]
})

export class MessagesModule {}
