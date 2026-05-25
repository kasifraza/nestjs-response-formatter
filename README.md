# @kasifraza/nestjs-response-formatter

Standardized API response wrapper for NestJS with automatic pagination detection, error formatting, and custom messages.

## Install

```bash
npm install @kasifraza/nestjs-response-formatter
```

## Setup

```ts
// main.ts
import { ResponseInterceptor, ResponseExceptionFilter } from '@kasifraza/nestjs-response-formatter';
import { Reflector } from '@nestjs/core';

const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));
app.useGlobalFilters(new ResponseExceptionFilter());
```

## Usage

### Basic response (auto-wrapped)

```ts
@Get()
findAll() {
  return [{ id: 1, name: 'John' }];
}
// Output: { success: true, statusCode: 200, message: "Success", data: [...], timestamp: "..." }
```

### Custom message

```ts
import { ResponseMessage } from '@kasifraza/nestjs-response-formatter';

@Post()
@ResponseMessage('User created successfully')
create(@Body() dto: CreateUserDto) {
  return this.userService.create(dto);
}
// Output: { success: true, statusCode: 201, message: "User created successfully", data: {...} }
```

### Pagination (auto-detected)

Return a `PaginatedResult` shape and meta is added automatically:

```ts
import { PaginationDto } from '@kasifraza/nestjs-response-formatter';

@Get()
async findAll(@Query() query: any) {
  const pagination = new PaginationDto(query);
  const [items, total] = await this.repo.findAndCount({
    skip: pagination.skip,
    take: pagination.limit,
  });
  return { data: items, total, page: pagination.page, limit: pagination.limit };
}
// Output: { success: true, data: [...], meta: { page: 1, limit: 10, total: 50, totalPages: 5, hasNext: true, hasPrev: false } }
```

### Skip formatting

```ts
import { SkipResponseFormat } from '@kasifraza/nestjs-response-formatter';

@Get('health')
@SkipResponseFormat()
health() {
  return { status: 'ok' }; // returned as-is
}
```

### Error responses (automatic)

```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Validation errors:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "email must be an email",
  "errors": ["email must be an email", "name should not be empty"],
  "timestamp": "..."
}
```

## API

| Export | Description |
|--------|-------------|
| `ResponseInterceptor` | Global interceptor that wraps all responses |
| `ResponseExceptionFilter` | Global filter for consistent error responses |
| `ResponseMessage(msg)` | Decorator to set custom success message |
| `SkipResponseFormat()` | Decorator to skip formatting for a route |
| `PaginationDto` | DTO with `page`, `limit`, `skip` from query params |

## Interfaces

```ts
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

## License

MIT
