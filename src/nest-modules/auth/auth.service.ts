import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {
    this.jwtService = jwtService;
  }

  login(email: string, password: string) {
    const payload = { email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
