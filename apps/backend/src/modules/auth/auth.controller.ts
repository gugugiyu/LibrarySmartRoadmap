import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @Post('login')
    async login(@Body() body: any) {
        const {email, password} = body || {};
        const token = await this.auth.login(email, password);
        if (!token) {
            return {error: 'Invalid credentials'};
        }
        return token;
    }
}