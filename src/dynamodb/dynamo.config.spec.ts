import { ConfigService } from '@nestjs/config';
import { getDynamoConfig } from './dynamo.config';

describe('getDynamoConfig', () => {
let configService: Partial<ConfigService>;

beforeEach(() => {
configService = {
    get: jest.fn(),
};
});

it('should return config with fake credentials for local endpoint', () => {
(configService.get as jest.Mock).mockImplementation((key: string) => {
    if (key === 'DYNAMO_ENDPOINT') return 'http://localhost:8000';
    if (key === 'AWS_REGION') return 'us-east-1';
    return undefined;
});

const config = getDynamoConfig(configService as ConfigService);
expect(config).toEqual({
    endpoint: 'http://localhost:8000',
    region: 'us-east-1',
    credentials: {
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
    },
});
});

it('should return config with real credentials for non-local endpoint', () => {
(configService.get as jest.Mock).mockImplementation((key: string) => {
    switch (key) {
    case 'DYNAMO_ENDPOINT':
        return 'https://dynamodb.us-east-1.amazonaws.com';
    case 'AWS_REGION':
        return 'us-east-1';
    case 'AWS_ACCESS_KEY_ID':
        return 'real-access-key';
    case 'AWS_SECRET_ACCESS_KEY':
        return 'real-secret-key';
    default:
        return undefined;
    }
});

const config = getDynamoConfig(configService as ConfigService);
expect(config).toEqual({
    endpoint: 'https://dynamodb.us-east-1.amazonaws.com',
    region: 'us-east-1',
    credentials: {
    accessKeyId: 'real-access-key',
    secretAccessKey: 'real-secret-key',
    },
});
});


it('should throw error if AWS_ACCESS_KEY_ID is missing for non-local', () => {
(configService.get as jest.Mock).mockImplementation((key: string) => {
    if (key === 'DYNAMO_ENDPOINT') return 'https://dynamodb.us-east-1.amazonaws.com';
    if (key === 'AWS_REGION') return 'us-east-1';
    if (key === 'AWS_SECRET_ACCESS_KEY') return 'real-secret-key';
    return undefined;
});

expect(() => getDynamoConfig(configService as ConfigService)).toThrowError(
    'Missing AWS_ACCESS_KEY_ID',
);
});

it('should throw error if AWS_SECRET_ACCESS_KEY is missing for non-local', () => {
(configService.get as jest.Mock).mockImplementation((key: string) => {
    if (key === 'DYNAMO_ENDPOINT') return 'https://dynamodb.us-east-1.amazonaws.com';
    if (key === 'AWS_REGION') return 'us-east-1';
    if (key === 'AWS_ACCESS_KEY_ID') return 'real-access-key';
    return undefined;
});

expect(() => getDynamoConfig(configService as ConfigService)).toThrowError(
    'Missing AWS_SECRET_ACCESS_KEY',
);
});

it('should treat endpoint with "dynamodb-local" as local and return fake credentials', () => {
  (configService.get as jest.Mock).mockImplementation((key: string) => {
    if (key === 'DYNAMO_ENDPOINT') return 'http://dynamodb-local:8000';
    if (key === 'AWS_REGION') return 'us-east-1';
    return undefined;
  });

  const config = getDynamoConfig(configService as ConfigService);
  expect(config.credentials.accessKeyId).toBe('fake');
  expect(config.credentials.secretAccessKey).toBe('fake');
});

it('should throw error if AWS_ACCESS_KEY_ID is missing in remote mode', () => {
  (configService.get as jest.Mock).mockImplementation((key: string) => {
    if (key === 'DYNAMO_ENDPOINT') return 'https://remote-endpoint.amazonaws.com';
    if (key === 'AWS_REGION') return 'us-east-1';
    if (key === 'AWS_SECRET_ACCESS_KEY') return 'secret';
    return undefined; 
  });

  expect(() => getDynamoConfig(configService as ConfigService)).toThrowError('Missing AWS_ACCESS_KEY_ID');
});

it('should throw error if AWS_SECRET_ACCESS_KEY is missing in remote mode', () => {
  (configService.get as jest.Mock).mockImplementation((key: string) => {
    if (key === 'DYNAMO_ENDPOINT') return 'https://remote-endpoint.amazonaws.com';
    if (key === 'AWS_REGION') return 'us-east-1';
    if (key === 'AWS_ACCESS_KEY_ID') return 'access-key';
    return undefined;
  });

  expect(() => getDynamoConfig(configService as ConfigService)).toThrowError('Missing AWS_SECRET_ACCESS_KEY');
});

it('should throw error if region is missing', () => {
  (configService.get as jest.Mock).mockImplementation((key: string) => {
    if (key === 'DYNAMO_ENDPOINT') return 'http://localhost:8000';
    if (key === 'AWS_REGION') return undefined;  
    return undefined;
  });

  expect(() => getDynamoConfig(configService as ConfigService)).toThrowError(
    'Faltam configurações da AWS no .env',
  );
});

});
