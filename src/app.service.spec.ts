import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('should return greeting message', () => {
    expect(service.getHello()).toBe('API operando normalmente');
  });

  it('should return app status with uptime', () => {
    const result = service.getAppStatus();
    expect(result.status).toBe('ok');
    expect(typeof result.uptime).toBe('number');
    expect(result.uptime).toBeGreaterThanOrEqual(0);
  });
});
