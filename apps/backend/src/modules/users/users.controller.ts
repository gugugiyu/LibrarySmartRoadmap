import { Controller, Get, Req, UseGuards } from "@nestjs/common"
import { UsersService } from "./users.service"
import { AuthGuard } from "@nestjs/passport"

@Controller('users')
export class UsersController {
    constructor(private readonly users: UsersService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    
    async me(@Req() req: any) {
        const userId = req.user?.sub;
        const user = await this.users.findById(userId);
        return this.users.toPulic(user);
    }
}