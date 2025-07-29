import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';
import { getDynamoConfig } from './dynamo.config';
import { DynamoService } from './dynamodb.service';

export const DynamoProvider = {
  provide: 'DYNAMO_CLIENT',
  inject: [DynamoService],
  useFactory: (dynamoService: DynamoService) => dynamoService.getDocumentClient(),
};
