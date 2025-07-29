import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { BadRequestException } from '@nestjs/common';

describe('MessagesController', () => {
  let controller: MessagesController;
  let service: MessagesService;

  const mockMessagesService = {
    create: jest.fn(),
    findById: jest.fn(),
    findBySender: jest.fn(),
    findByPeriod: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        {
          provide: MessagesService,
          useValue: mockMessagesService,
        },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return result', async () => {
      const dto: CreateMessageDto = { content: 'Olá', sender: '+5511999999999' };
      const result = { id: '1', ...dto, sentAt: new Date().toISOString(), status: 'enviado' };
      mockMessagesService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(mockMessagesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findById', () => {
    it('should throw if id is not provided', async () => {
      await expect(controller.findById(undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('should return message if found', async () => {
      const message = { id: '1', content: 'Olá', sender: '+5511999999999' };
      mockMessagesService.findById.mockResolvedValue(message);

      expect(await controller.findById('1')).toEqual(message);
    });
  });

  describe('find', () => {
    it('should call findBySender if sender is provided', async () => {
      const result = [{ id: '1', sender: '+5511999999999', content: 'Olá' }];
      mockMessagesService.findBySender.mockResolvedValue(result);

      const response = await controller.find('+5511999999999');
      expect(response).toEqual(result);
    });

    it('should call findByPeriod if startDate and endDate are provided', async () => {
      const result = [{ id: '1' }];
      mockMessagesService.findByPeriod.mockResolvedValue(result);

      const response = await controller.find(undefined, '2025-01-01', '2025-01-02');
      expect(response).toEqual(result);
    });

    it('should throw BadRequestException if neither sender nor dates are provided', async () => {
      await expect(controller.find()).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should throw if id is missing', async () => {
      await expect(controller.updateStatus(undefined as any, { status: 'lido' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call service.updateStatus and return result', async () => {
      const dto: UpdateStatusDto = { status: 'lido' };
      const updated = { id: '1', status: 'lido' };
      mockMessagesService.updateStatus.mockResolvedValue(updated);

      expect(await controller.updateStatus('1', dto)).toEqual(updated);
    });
  });
});
