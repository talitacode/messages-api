import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
const config = new DocumentBuilder()
.setTitle('Messages API')
.setDescription('Documentação da API de mensagens via WhatsApp')
.setVersion('1.0')
.addBearerAuth()
.build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document); // http://localhost:3000/docs
}
