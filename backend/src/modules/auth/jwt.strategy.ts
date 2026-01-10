import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { jwtConstants } from 'src/constants/common.const';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: (req) => {
        return req?.cookies?.access_token;
      },
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: { sub: string; sid: string }) {
    // First, find the session
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
      include: { user: true },
    });

    if (!session || session.revokedAt) {
      throw new UnauthorizedException('Invalid session');
    }

    // Optionally check if user matches payload.sub
    if (session.userId !== payload.sub) {
      throw new UnauthorizedException('Session does not belong to user');
    }

    return {
      id: session.user.id,
      email: session.user.email,
      sessionId: session.id,
      twoFactorEnabled: session.user.twoFactorEnabled,
      displayName: `${session.user.firstName} ${session.user.lastName}`
    };
  }

}
