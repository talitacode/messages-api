import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagesModule } from './messages/messages.module';
import { DynamoModule } from './dynamodb/dynamodb.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';    

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '../dev/.env', 
    }),
    MessagesModule,
    DynamoModule,
  ],
    controllers: [AppController],
    providers: [AppService],       
})

export class AppModule {}
