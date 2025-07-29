import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'O campo "content" não pode estar vazio.' })
  @ApiProperty({ example: 'Olá, tudo bem ?' })
  content: string;

  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'O campo "sender" deve ser um número de telefone válido (WhatsApp). Ex: +5511999998888',
  })
  @ApiProperty({ example: '+5511999999999' })
  sender: string;
}
