import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevSeedService } from './dev-seed.service';
import { User } from '../../models/user.entity';
import { TextualInformation, TextualContentType } from '../../models/textual_information.entity';
import { Book } from '../../models/book.entity';
import { Article } from '../../models/article.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, TextualInformation, Book, Article])],
    providers: [DevSeedService],
})
export class DevSeedModule {}
