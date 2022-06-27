import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

export function Firewall(options?: {
  anonymous?: boolean;
  throttle?: { limit: number; ttl: number };
  skipThrottle?: boolean;
}) {
  const { throttle, anonymous, skipThrottle } = options || {
    anonymous: false,
  };

  const decorators = [];
  const guards = [];

  if (!anonymous) {
    guards.push(JwtAuthGuard);
  }

  decorators.push(UseGuards(...guards));

  if (skipThrottle) {
    decorators.push(SkipThrottle());
  } else if (throttle) {
    decorators.push(Throttle(throttle.limit, throttle.ttl));
  }

  return applyDecorators(...decorators);
}
