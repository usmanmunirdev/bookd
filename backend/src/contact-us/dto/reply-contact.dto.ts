import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class ReplyContactDto {
    @IsString()
    @MinLength(3)
    @MaxLength(3000)
    @Transform(({ value }) => value.trim())
    reply: string;

    @IsString()
    @MinLength(3)
    @MaxLength(200)
    @Transform(({ value }) => value.trim())
    replySubject: string;

    @IsString()
    repliedBy: string;
}
