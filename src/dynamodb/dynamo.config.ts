import { ConfigService } from '@nestjs/config';

export function getDynamoConfig(configService: ConfigService) {

  const rawEndpoint = configService.get<string>('DYNAMO_ENDPOINT');
  const rawRegion = configService.get<string>('AWS_REGION');

  if (!rawRegion || !rawEndpoint) {
    throw new Error('Faltam configurações da AWS no .env');
  }

  const endpoint = rawEndpoint;
  const region = rawRegion;

  const isLocal = endpoint.includes('localhost') || endpoint.includes('dynamodb-local');

  const accessKeyId = isLocal
    ? 'fake'
    : configService.get<string>('AWS_ACCESS_KEY_ID') ?? (() => { throw new Error('Missing AWS_ACCESS_KEY_ID'); })();

  const secretAccessKey = isLocal
    ? 'fake'
    : configService.get<string>('AWS_SECRET_ACCESS_KEY') ?? (() => { throw new Error('Missing AWS_SECRET_ACCESS_KEY'); })();

  return {
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  };
}
