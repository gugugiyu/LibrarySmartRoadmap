import { Injectable } from '@nestjs/common';
import { LexicalRepository, SearchHit } from '../types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextualInformation } from '../../../models/textual_information.entity';
import { Book } from '../../../models/book.entity';
import { Article } from '../../../models/article.entity';

@Injectable()
export class LexicalRepo implements LexicalRepository {
    constructor(
        @InjectRepository(TextualInformation)
        private readonly tiRepo: Repository<TextualInformation>,
        @InjectRepository(Book) private readonly bookRepo: Repository<Book>,
        @InjectRepository(Article) private readonly artRepo: Repository<Article>,
    ) {}

    async search(q: string, _filters: any, limit: number): Promise<SearchHit[]> {
        const qb = this.tiRepo.createQueryBuilder('ti').where('ti.deleted_at IS NULL');
        const tokens = (q || '').trim().split(/\s+/).filter(Boolean);
        if (tokens.length) {
            const ors: string[] = [];
            const params: Record<string, string> = {};
            tokens.forEach((tk, i) => {
                ors.push(`ti.title ILIKE :q${i}`);
                params[`q${i}`] = `%${tk}%`;
            });
            qb.andWhere(ors.join(' OR '), params); // khớp BẤT KỲ token nào
        }
        qb.take(Math.max(limit, 20));
        const tis = await qb.getMany();
        if (!tis.length) return [];

        // chấm điểm
        const ids = tis.map((t) => t.id);
        const [books, arts] = await Promise.all([
            this.bookRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids }).getMany(),
            this.artRepo.createQueryBuilder('a').where('a.id IN (:...ids)', { ids }).getMany(),
        ]);
        const bmap = new Map(books.map((b) => [b.id, b]));
        const amap = new Map(arts.map((a) => [a.id, a]));

        const scored: SearchHit[] = tis.map((t) => {
            const hay =
                (t.title || '') +
                ' ' +
                (t.source_url || '') +
                ' ' +
                (bmap.get(t.id)?.author || '') +
                ' ' +
                (amap.get(t.id)?.authors || '');
            const lower = hay.toLowerCase();
            const score = tokens.reduce((acc, tk) => acc + (lower.includes(tk) ? 1 : 0), 0) || 0.1;
            return { id: String(t.id), score };
        });

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit);
    }
}
