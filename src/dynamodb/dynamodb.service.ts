import { Injectable, Inject } from '@nestjs/common';
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { winstonLogger } from '../logger/winston.logger';

@Injectable()
export class DynamoService {
  constructor(
    @Inject('DYNAMO_RAW_CLIENT')
    private readonly rawClient: DynamoDBClient,
  ) {}

  async createTableIfNotExists() {
    try {
      await this.rawClient.send(
        new CreateTableCommand({
          TableName: 'Messages',
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
        }),
      );
      winstonLogger.log('info', 'Tabela "Messages" criada');
    } catch (err: any) {
      if (err.name === 'ResourceInUseException') {
        winstonLogger.log('info', 'Tabela "Messages" já existe');
      } else {
        winstonLogger.error('Erro ao criar a tabela:', err);
      }
    }
  }

  getDocumentClient(): DynamoDBDocumentClient {
    return DynamoDBDocumentClient.from(this.rawClient);
  }
}
