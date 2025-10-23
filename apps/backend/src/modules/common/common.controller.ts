import { Controller, Get } from '@nestjs/common';

@Controller('common')
export class CommonController {
  @Get('health')
  health(): string {
    return '1';
  }
}
