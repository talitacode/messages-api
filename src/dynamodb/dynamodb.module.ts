import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { getDynamoConfig } from './dynamo.config';
import { DynamoService } from './dynamodb.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DYNAMO_RAW_CLIENT',
      useFactory: (cs: ConfigService) =>
        new DynamoDBClient(getDynamoConfig(cs)),
      inject: [ConfigService],
    },
    {
      provide: 'DYNAMO_CLIENT',
      useFactory: (raw: DynamoDBClient) =>
        DynamoDBDocumentClient.from(raw),
      inject: ['DYNAMO_RAW_CLIENT'],
    },
    DynamoService,
  ],
  exports: ['DYNAMO_RAW_CLIENT', 'DYNAMO_CLIENT', DynamoService],
})
export class DynamoModule {}
