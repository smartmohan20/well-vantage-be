import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Controller responsible for handling user-related requests.
 */
@Controller('users')
export class UsersController {
    /**
     * Placeholder for user profile retrieval.
     * Currently commented out until authentication is fully implemented.
     */
    // @UseGuards(AuthGuard('jwt'))
    // @Get('me')
    // getProfile(@Request() req) {
    //   return req.user;
    // }
}
