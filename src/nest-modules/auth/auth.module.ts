import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        publicKey: configService.get('JWT_PUBLIC_KEY'),
        privateKey: configService.get('JWT_PRIVATE_KEY'),
        signOptions: {
          algorithm: 'RS256',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthGuard],
})
export class AuthModule {}
