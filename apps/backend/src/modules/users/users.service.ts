import { Injectable } from "@nestjs/common"
import * as bcrypt from 'bcryptjs'

export type User = {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    level ?: string;
    background ?: string;
    pace ?: string;
};

@Injectable()
export class UsersService {
    private users: User[] = [
        {
            id: 'oantalavantestcase36',
            email: 'test@gmail.com',
            name: 'Test User',
            passwordHash: bcrypt.hashSync('123456', 10),
            level: 'freshman',
            background: 'none',
            pace: '30'      // Pages per day
        },
    ];

    async findByEmail(email: string): Promise<User | undefined> {
        return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }

    async findById(id: string): Promise<User | undefined> {
        return this.users.find(user => user.id === id);
    }

    toPulic(user: User) {
        if (!user)
            return null
        const {passwordHash, ...rest} = user;
        return rest;
    }
}