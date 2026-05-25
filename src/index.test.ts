import { of } from 'rxjs';
import { ResponseInterceptor } from './interceptor';
import { PaginationDto } from './pagination.dto';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;
  let reflector: any;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    interceptor = new ResponseInterceptor(reflector);
  });

  const mockContext = (statusCode = 200) => ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getResponse: () => ({ statusCode }) }),
  }) as any;

  const mockNext = (data: any) => ({ handle: () => of(data) }) as any;

  it('wraps plain response', (done) => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    interceptor.intercept(mockContext(), mockNext({ id: 1 })).subscribe((res: any) => {
      expect(res.success).toBe(true);
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual({ id: 1 });
      expect(res.message).toBe('Success');
      expect(res.timestamp).toBeDefined();
      done();
    });
  });

  it('uses custom message from decorator', (done) => {
    reflector.getAllAndOverride.mockImplementation((key: string) =>
      key === 'response_message' ? 'User created' : undefined
    );
    interceptor.intercept(mockContext(201), mockNext({ id: 1 })).subscribe((res: any) => {
      expect(res.message).toBe('User created');
      expect(res.statusCode).toBe(201);
      done();
    });
  });

  it('detects paginated result and adds meta', (done) => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const paginated = { data: [1, 2, 3], total: 30, page: 2, limit: 10 };
    interceptor.intercept(mockContext(), mockNext(paginated)).subscribe((res: any) => {
      expect(res.meta).toBeDefined();
      expect(res.meta!.page).toBe(2);
      expect(res.meta!.totalPages).toBe(3);
      expect(res.meta!.hasNext).toBe(true);
      expect(res.meta!.hasPrev).toBe(true);
      expect(res.data).toEqual([1, 2, 3]);
      done();
    });
  });

  it('skips formatting when SkipResponseFormat is set', (done) => {
    reflector.getAllAndOverride.mockImplementation((key: string) =>
      key === 'skip_response_format' ? true : undefined
    );
    interceptor.intercept(mockContext(), mockNext('raw')).subscribe((res: any) => {
      expect(res).toBe('raw');
      done();
    });
  });
});

describe('PaginationDto', () => {
  it('parses page and limit from query', () => {
    const dto = new PaginationDto({ page: '3', limit: '20' });
    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(20);
    expect(dto.skip).toBe(40);
  });

  it('defaults to page 1, limit 10', () => {
    const dto = new PaginationDto({});
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    expect(dto.skip).toBe(0);
  });

  it('clamps limit to max 100', () => {
    const dto = new PaginationDto({ limit: '500' });
    expect(dto.limit).toBe(100);
  });

  it('clamps page to min 1', () => {
    const dto = new PaginationDto({ page: '-5' });
    expect(dto.page).toBe(1);
  });
});
