import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

describe('MessagesService', () => {
  let service: MessagesService;
  let dbMock: Partial<DynamoDBDocumentClient>;

  const mockDbSend = jest.fn();

  beforeEach(async () => {
    dbMock = {
      send: mockDbSend,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: 'DYNAMO_CLIENT', useValue: dbMock },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if content or sender is missing', async () => {
      await expect(service.create({ content: '', sender: '' } as any)).rejects.toThrow(BadRequestException);
    });

    it('should create and return a message item', async () => {
      mockDbSend.mockResolvedValueOnce({});
      const result = await service.create({ content: 'msg', sender: '+5511999999999' });
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('sentAt');
      expect(mockDbSend).toHaveBeenCalledWith(expect.any(PutCommand));
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if message not found', async () => {
      mockDbSend.mockResolvedValueOnce({ Item: undefined });
      await expect(service.findById('123')).rejects.toThrow(NotFoundException);
    });

    it('should return the found message', async () => {
      const item = { id: '123', content: 'Hello' };
      mockDbSend.mockResolvedValueOnce({ Item: item });
      const result = await service.findById('123');
      expect(result).toEqual(item);
      expect(mockDbSend).toHaveBeenCalledWith(expect.any(GetCommand));
    });
  });

  describe('findBySender', () => {
    it('should throw BadRequestException for invalid sender', async () => {
      await expect(service.findBySender('')).rejects.toThrow(BadRequestException);
    });

    it('should format sender with "+" if missing and return items', async () => {
      const items = [{ id: '1', sender: '+5511999999999' }];
      mockDbSend.mockResolvedValueOnce({ Items: items });
      const result = await service.findBySender('5511999999999');
      expect(result).toEqual(items);
      expect(mockDbSend).toHaveBeenCalledWith(expect.any(ScanCommand));
    });
  });

  describe('findByPeriod', () => {
    it('should throw BadRequestException if dates are missing', async () => {
      await expect(service.findByPeriod('', '')).rejects.toThrow(BadRequestException);
    });

    it('should return messages between two dates', async () => {
      const items = [{ id: '1' }];
      mockDbSend.mockResolvedValueOnce({ Items: items });
      const result = await service.findByPeriod('2025-01-01', '2025-12-31');
      expect(result).toEqual(items);
      expect(mockDbSend).toHaveBeenCalledWith(expect.any(ScanCommand));
    });
  });

  describe('updateStatus', () => {
    it('should throw BadRequestException for invalid status', async () => {
      await expect(service.updateStatus('1', { status: 'errado' })).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if update returns no Attributes', async () => {
      mockDbSend.mockResolvedValueOnce({ Attributes: undefined });
      await expect(service.updateStatus('1', { status: 'lido' })).rejects.toThrow(NotFoundException);
    });

    it('should return updated message', async () => {
      const updated = { id: '1', status: 'lido' };
      mockDbSend.mockResolvedValueOnce({ Attributes: updated });
      const result = await service.updateStatus('1', { status: 'lido' });
      expect(result).toEqual(updated);
      expect(mockDbSend).toHaveBeenCalledWith(expect.any(UpdateCommand));
    });
  });
});
