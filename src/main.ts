import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { CreateTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';
import { winstonLogger } from './logger/winston.logger';
import { setupSwagger } from './swagger';
import { getDynamoConfig } from './dynamodb/dynamo.config';
import { DynamoService } from './dynamodb/dynamodb.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });
  const configService  = app.get(ConfigService);
  
   const dynamoService = app.get(DynamoService);
  await dynamoService.createTableIfNotExists();
  
  app.enableVersioning({ type: VersioningType.URI });
  app.enableCors({ origin: '*', credentials: true });
  setupSwagger(app);

  await app.listen(3000, '0.0.0.0');
  winstonLogger.log('info', 'Rodando em http://0.0.0.0:3000');
  winstonLogger.log('info', 'Swagger em http://localhost:3000/docs');
}

bootstrap();
