import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';

export const User: () => ParameterDecorator = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return (request.user as CreateUserDto) || null;
  },
);
