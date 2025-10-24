import { Injectable } from '@nestjs/common';
import { VectorRepository, SearchHit } from '../types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextualInformation } from '../../../models/textual_information.entity';
import { Book } from '../../../models/book.entity';
import { Article } from '../../../models/article.entity';

function jaccard(a: Set<string>, b: Set<string>): number {
    const inter = new Set([...a].filter((x) => b.has(x))).size;
    const union = new Set([...a, ...b]).size || 1;
    return inter / union;
}

@Injectable()
export class VectorRepo implements VectorRepository {
    constructor(
        @InjectRepository(TextualInformation)
        private readonly tiRepo: Repository<TextualInformation>,
        @InjectRepository(Book) private readonly bookRepo: Repository<Book>,
        @InjectRepository(Article) private readonly artRepo: Repository<Article>,
    ) {}

    async search(_embedding: number[], filters: any, limit: number): Promise<SearchHit[]> {
        const query = (filters?.__q || '').toString();
        const qb = this.tiRepo.createQueryBuilder('ti').where('ti.deleted_at IS NULL');
        const tokens = (query || '').trim().split(/\s+/).filter(Boolean);
        if (tokens.length) {
            const ors: string[] = [];
            const params: Record<string, string> = {};
            tokens.forEach((tk, i) => {
                ors.push(`ti.title ILIKE :q${i}`);
                params[`q${i}`] = `%${tk}%`;
            });
            qb.andWhere(ors.join(' OR '), params);
        }

        qb.take(Math.max(limit, 20));
        const tis = await qb.getMany();
        if (!tis.length) return [];

        const ids = tis.map((t) => t.id);
        const [books, arts] = await Promise.all([
            this.bookRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids }).getMany(),
            this.artRepo.createQueryBuilder('a').where('a.id IN (:...ids)', { ids }).getMany(),
        ]);
        const bmap = new Map(books.map((b) => [b.id, b]));
        const amap = new Map(arts.map((a) => [a.id, a]));

        const qTokens = new Set<string>(query.toLowerCase().split(/\s+/).filter(Boolean));
        const hits: SearchHit[] = tis.map((t) => {
            const hay =
                (t.title || '') +
                ' ' +
                (bmap.get(t.id)?.author || '') +
                ' ' +
                (amap.get(t.id)?.authors || '');
            const rTokens = new Set<string>(hay.toLowerCase().split(/\s+/).filter(Boolean));
            const score = jaccard(qTokens, rTokens) || 0.05;
            return { id: String(t.id), score };
        });

        hits.sort((a, b) => b.score - a.score);
        return hits.slice(0, limit);
    }
}
