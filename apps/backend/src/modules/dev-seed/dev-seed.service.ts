import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../models/user.entity';
import { TextualInformation, TextualContentType } from '../../models/textual_information.entity';
import { Book } from '../../models/book.entity';
import { Article } from '../../models/article.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DevSeedService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(TextualInformation)
        private readonly tiRepo: Repository<TextualInformation>,
        @InjectRepository(Book) private readonly bookRepo: Repository<Book>,
        @InjectRepository(Article) private readonly artRepo: Repository<Article>,
    ) {}

    async onApplicationBootstrap() {
        if (process.env.NODE_ENV !== 'development') return;

        // seed user
        const ucount = await this.userRepo.count();
        if (ucount === 0) {
            const u = this.userRepo.create({
                email: 'test@gmail.com',
                username: 'Test User',
                password_hash: bcrypt.hashSync('123456', 10),
                enrollment_date: new Date(),
            });
            await this.userRepo.save(u);
            // eslint-disable-next-line no-console
            console.log('[seed] user test@gmail.com / 123456');
        }

        // seed TI + Book/Article
        const tcount = await this.tiRepo.count();
        if (tcount === 0) {
            // 1) Book
            const ti1 = await this.tiRepo.save(
                this.tiRepo.create({
                    title: 'Xác suất cơ bản cho sinh viên năm nhất',
                    source_url: 'https://example.com/prob-basic',
                    info_type: TextualContentType.BOOK,
                }),
            );
            await this.bookRepo.save(
                this.bookRepo.create({
                    id: ti1.id,
                    base: ti1,
                    isbn: '978-1',
                    author: 'Nhiều tác giả',
                    publisher: 'NXB Giáo Dục',
                    publication_year: 2020,
                }),
            );

            // 2) Article
            const ti2 = await this.tiRepo.save(
                this.tiRepo.create({
                    title: 'Bài tập nhập môn Xác suất',
                    source_url: 'https://example.com/prob-exercises',
                    info_type: TextualContentType.ARTICLE,
                }),
            );
            await this.artRepo.save(
                this.artRepo.create({
                    id: ti2.id,
                    base: ti2,
                    journal_name: 'VJEd',
                    doi: '10.1234/vjed.0001',
                    authors: 'Nguyễn Văn A',
                    publisher: 'VJEd',
                    publication_date: new Date('2021-01-01'),
                }),
            );

            const ti3 = await this.tiRepo.save(
                this.tiRepo.create({
                    title: 'Kỹ thuật đếm và tổ hợp nâng cao',
                    source_url: 'https://example.com/combinatorics',
                    info_type: TextualContentType.ARTICLE,
                }),
            );
            await this.artRepo.save(
                this.artRepo.create({
                    id: ti3.id,
                    base: ti3,
                    journal_name: 'MathVN',
                    doi: '10.1234/mathvn.0002',
                    authors: 'Trần B',
                    publisher: 'MathVN',
                    publication_date: new Date('2022-05-03'),
                }),
            );

            const ti4 = await this.tiRepo.save(
                this.tiRepo.create({
                    title: 'Ứng dụng xác suất trong học máy',
                    source_url: 'https://example.com/prob-ml',
                    info_type: TextualContentType.ARTICLE,
                }),
            );
            await this.artRepo.save(
                this.artRepo.create({
                    id: ti4.id,
                    base: ti4,
                    journal_name: 'AI VN',
                    doi: '10.1234/aivn.0003',
                    authors: 'Lê C',
                    publisher: 'AIVN',
                    publication_date: new Date('2023-09-10'),
                }),
            );

            // eslint-disable-next-line no-console
            console.log('[seed] 4 resources inserted');
        }
    }
}
