import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Patch,
  BadRequestException,
  UseGuards
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller({ path: 'messages', version: '1' })
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Post()
  async create(@Body() dto: CreateMessageDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('ID da mensagem é obrigatório');
    }
    return this.service.findById(id);
  }

  @Get()
  async find(
    @Query('sender') sender?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (sender) {
      return this.service.findBySender(sender);
    } else if (startDate && endDate) {
      return this.service.findByPeriod(startDate, endDate);
    } else {
      throw new BadRequestException('Forneça "sender" ou "startDate" e "endDate"');
    }
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    if (!id) {
      throw new BadRequestException('ID da mensagem é obrigatório');
    }
    return this.service.updateStatus(id, dto);
  }
}
