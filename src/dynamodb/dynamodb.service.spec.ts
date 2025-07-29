import { Test, TestingModule } from '@nestjs/testing';
import { DynamoService } from './dynamodb.service';
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { winstonLogger } from '../logger/winston.logger';


jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({
      send: jest.fn(),
    })),
  },
}));

describe('DynamoService', () => {
  let service: DynamoService;
  let rawClientMock: Partial<DynamoDBClient>;
  let sendMock: jest.Mock;

  beforeEach(async () => {
    sendMock = jest.fn();

    rawClientMock = {
      send: sendMock,
    };

    jest.spyOn(winstonLogger, 'log').mockImplementation(() => {});
    jest.spyOn(winstonLogger, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DynamoService,
        { provide: 'DYNAMO_RAW_CLIENT', useValue: rawClientMock },
      ],
    }).compile();

    service = module.get<DynamoService>(DynamoService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('createTableIfNotExists', () => {
    it('should create table successfully', async () => {
      sendMock.mockResolvedValueOnce({});

      await service.createTableIfNotExists();

      expect(sendMock).toHaveBeenCalledWith(expect.any(CreateTableCommand));
    });

    it('should log info if table already exists', async () => {
      const error = { name: 'ResourceInUseException' };
      sendMock.mockRejectedValueOnce(error);

      await service.createTableIfNotExists();

      expect(sendMock).toHaveBeenCalledWith(expect.any(CreateTableCommand));
      expect(winstonLogger.log).toHaveBeenCalledWith('info', 'Tabela "Messages" já existe');
    });

    it('should log error on unexpected error', async () => {
      const error = new Error('Unexpected');
      sendMock.mockRejectedValueOnce(error);

      await service.createTableIfNotExists();

      expect(sendMock).toHaveBeenCalledWith(expect.any(CreateTableCommand));
      expect(winstonLogger.error).toHaveBeenCalledWith('Erro ao criar a tabela:', error);
      expect(winstonLogger.log).not.toHaveBeenCalledWith(expect.stringContaining('Tabela "Messages" criada'));
    });
  });

  describe('getDocumentClient', () => {
    it('should return a DynamoDBDocumentClient instance', () => {
      const docClient = service.getDocumentClient();
      expect(docClient).toBeDefined();
      expect(typeof docClient.send).toBe('function');
    });
  });
});
