import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { UsersService } from "../users/users.service"
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
    constructor(
        private readonly users: UsersService,
        private readonly jwt: JwtService,
    ) {}

    async validate(email: string, password: string) {
        const user = await this.users.findByEmail(email);
        if (!user)
            return null;

        const success = await bcrypt.compare(password, user.passwordHash);
        if (!success)
            return null;

        return user;
    }

    async login(email: string, password: string) {
        const user = await this.validate(email, password);
        if (!user) 
            return null

        const payload = { sub: user.id, email: user.email };
        const access_token = await this.jwt.signAsync(payload);

        return { access_token };
    }
}