import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';

export const User: () => ParameterDecorator = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return (request.user as UserDto) || null;
  },
);
