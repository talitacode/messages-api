import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { v4 as uuid } from 'uuid';
const winstonLogger = require('../logger/winston.logger').winstonLogger;


@Injectable()
export class MessagesService {
  private tableName = 'Messages';

  constructor(
    @Inject('DYNAMO_CLIENT')
    private readonly db: DynamoDBDocumentClient,
  ) {}

  async create(dto: CreateMessageDto) {
    if (!dto.content || !dto.sender) {
      throw new BadRequestException('Conteúdo e remetente são obrigatórios');
    }

    const item = {
      id: uuid(),
      content: dto.content,
      sender: dto.sender,
      sentAt: new Date().toISOString(),
      status: 'enviado',
    };

    await this.db.send(new PutCommand({ TableName: this.tableName, Item: item }));
    winstonLogger.log('info', `Mensagem criada com ID ${item.id} por ${item.sender}`);

    return item;
  }

  async findById(id: string) {
    const result = await this.db.send(new GetCommand({ TableName: this.tableName, Key: { id } }));
    if (!result.Item) throw new NotFoundException(`Mensagem com ID ${id} não encontrada`);
    return result.Item;
  }

  async findBySender(sender: string) {
  if (!sender || typeof sender !== 'string' || !sender.trim()) {
    throw new BadRequestException('Parâmetro "sender" (telefone) é obrigatório e deve ser uma string válida.');
  }

  sender = sender.trim();
    if (!sender.startsWith('+')) {
    sender = `+${sender}`;
  }
    
    const result = await this.db.send(new ScanCommand({
      TableName: this.tableName,
      FilterExpression: '#sender = :sender',
      ExpressionAttributeNames: {
        '#sender': 'sender',
      },
      ExpressionAttributeValues: {
        ':sender': sender,
      },
    }));
    return result.Items;
  }

  async findByPeriod(startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      throw new BadRequestException('Parâmetros startDate e endDate são obrigatórios');
    }

    const result = await this.db.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: '#sentAt BETWEEN :start AND :end',
        ExpressionAttributeNames: {
          '#sentAt': 'sentAt',
        },
        ExpressionAttributeValues: {
          ':start': startDate,
          ':end': endDate,
        },
      }),
    );
    return result.Items;
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const { status } = dto;
    
  const validStatuses = ['enviado', 'recebido', 'lido'];

  if (!validStatuses.includes(status)) {
    throw new BadRequestException(
      'Status inválido. Deve ser "enviado", "recebido" ou "lido".',
    );
  }
    const result = await this.db.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': status },
        ReturnValues: 'ALL_NEW',
      }),
    );

    if (!result.Attributes) {
      throw new NotFoundException(`Mensagem com ID ${id} não encontrada`);
    }
    winstonLogger.log('info', `Status da mensagem ${id} atualizado para ${status}`);

    return result.Attributes;
  }
}
