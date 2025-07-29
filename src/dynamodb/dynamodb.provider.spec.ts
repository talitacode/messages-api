import { DynamoProvider } from './dynamodb.provider';
import { DynamoService } from './dynamodb.service';

describe('DynamoProvider', () => {
  let dynamoServiceMock: Partial<DynamoService>;

  beforeEach(() => {
    dynamoServiceMock = {
      getDocumentClient: jest.fn().mockReturnValue('documentClientMock'),
    };
  });

  it('should have the correct provide token', () => {
    expect(DynamoProvider.provide).toBe('DYNAMO_CLIENT');
  });

  it('should inject DynamoService', () => {
    expect(DynamoProvider.inject).toEqual([DynamoService]);
  });

  it('useFactory should call getDocumentClient and return its result', () => {
    const result = DynamoProvider.useFactory(dynamoServiceMock as DynamoService);
    expect(dynamoServiceMock.getDocumentClient).toHaveBeenCalled();
    expect(result).toBe('documentClientMock');
  });
});
