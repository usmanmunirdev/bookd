import {
  Body,
  Controller,
  Post,
  Res,
  HttpException,
  HttpStatus,
  Req,
  Get,
  Put,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Param,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './user.service';
import { Response, Request } from 'express';
import { UpdateUserDto } from './dto/update.user.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('signup')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './public/uploads/profile',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const ext = extname(file.originalname).toLowerCase();
        const mimetype = allowedTypes.test(file.mimetype);
        if (ext && mimetype) {
          cb(null, true);
        } else {
          cb(
            new Error('Only image files (jpeg, jpg, png, gif) are allowed!'),
            false,
          );
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async signup(
    @Body()
    body: {
      firstName: string,
      lastName: string,
      fullName: string,
      email: string;
      password: string;
      phone: string;
      timezone: string;
    },
    @UploadedFile() profileImage: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { firstName, lastName, fullName, email, password, phone, timezone } = body;

    try {
      const profileImagePath = profileImage
        ? `/uploads/profile/${profileImage.filename}`
        : null;

      const result = await this.authService.signup(
        firstName,
        lastName,
        fullName,
        email,
        password,
        phone,
        timezone,
        profileImagePath,
      );
      return result;
      // const { token, user } = await this.authService.login(email, password);

      // res.cookie('token', token, {
      //   httpOnly: true,
      //   secure: false,
      //   sameSite: 'lax',
      //   maxAge: 7 * 24 * 60 * 60 * 1000,
      // });

      // return { message: 'Your account has been created.', user: { ...user, token } };
    } catch (error) {
      console.error('Signup error:', error.message || error);

      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Signup failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() body: { email: string; otp: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { fullUser, token }: any = await this.authService.verifyEmailOtp(body.email, body.otp);

      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { message: 'Email verified successfully', user: { ...fullUser, token } };
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.BAD_REQUEST, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('resend-otp')
  async resendOtp(
    @Body() body: { email: string },
  ) {
    try {
      const result = await this.authService.resendOtp(body.email);
      return result;
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.BAD_REQUEST, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  async login(@Body() body, @Res({ passthrough: true }) res: Response) {
    const { email, password } = body;

    try {
      const result = await this.authService.login(email, password);

      // Case 1️⃣: Unverified user
      if (result.status === 'unverified') {
        return {
          status: result.status,
          message: result.message,
          email: result.email,
        };
      }

      // Case 2️⃣: Verified user with token
      const { token, user } = result as { token: string; user: any };

      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return { message: 'Logged in successfully', user: { ...user, token } };
    } catch (error) {
      console.error('Login error:', error.message || error);

      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: error.message || 'Login failed',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('google-login')
  async googleLogin(
    @Body() body: { token: string; timezone?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, timezone } = body;

    if (!token) {
      throw new HttpException(
        { message: 'Google token is required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    console.log('📍 Timezone in controller:', timezone);

    try {
      const { user, token: jwtToken } = await this.authService.loginWithGoogle(token, timezone);

      res.cookie('token', jwtToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        message: 'Logged in with Google successfully',
        user: { ...user, token: jwtToken },
      };
    } catch (error) {
      throw new HttpException(
        { message: error.message || 'Google login failed' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Put('update-profile')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './public/uploads/profile',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const ext = extname(file.originalname).toLowerCase();
        const mimetype = allowedTypes.test(file.mimetype);
        if (ext && mimetype) {
          cb(null, true);
        } else {
          cb(
            new Error('Only image files (jpeg, jpg, png, gif) are allowed!'),
            false,
          );
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateUserDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    if (!dto.id) {
      throw new BadRequestException('User ID is required');
    }
    if (profileImage) {
      dto.profileImage = `/uploads/profile/${profileImage.filename}`;
    }

    const updated = await this.authService.updateUser(dto.id, dto);
    return {
      message: 'Profile updated successfully',
      user: updated,
    };
  }

  @Get(':userId')
  async getMe(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    const user = await this.authService.getUser(userId);
    return {
      user,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  // @UseGuards(JwtAuthGuard)
  async resetPassword(
    @Body() body: { token: string; newPassword: string }
  ) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: any,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    const userId = req.user?.sub;
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }

  @Post('delete-user')
  async deleteSignUpUser(
    @Body() body: { email: string; otp: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      return await this.authService.deleteSignUpUser(body.email);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.BAD_REQUEST, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
