import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @IsIn(['enviado', 'recebido', 'lido'], {
    message: 'Status deve ser "enviado", "recebido" ou "lido".',
  })
  @ApiProperty({ example: 'enviado' })
  status: string;
}
