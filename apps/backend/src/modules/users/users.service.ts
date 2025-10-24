import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../models/user.entity';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

    findByEmail(email: string) {
        return this.repo.findOne({ where: { email } });
    }

    findById(id: string) {
        return this.repo.findOne({ where: { id } });
    }

    toPublic(user: User | null | undefined) {
        if (!user) return null;
        const { password_hash, ...rest } = user as any;
        return rest;
    }
}
