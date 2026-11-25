import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async onModuleInit(): Promise<void> {
    const email = process.env.SEED_EMAIL?.trim().toLowerCase();
    const password = process.env.SEED_PASSWORD;
    if (!email || !password) return;
    const existing = await this.users.findOneBy({ email });
    if (!existing) {
      const passwordHash = await bcrypt.hash(password, 12);
      await this.users.save(this.users.create({
        name: process.env.SEED_NAME ?? 'Administrator',
        email,
        passwordHash,
      }));
    }
  }

  async login(email: string, password: string) {
    const user = await this.users.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}
