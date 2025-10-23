import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'

import { UsersModule } from '../users/users.module'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './auth.strategy'

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET') || 'dev-secret',
                signOptions: {expiresIn: '7d'},

            })
        })
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
})

export class AuthModule {}