import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextualInformation, TextualContentType } from '../../models/textual_information.entity';
import { Book } from '../../models/book.entity';
import { Article } from '../../models/article.entity';

export type ResourceDTO = {
    id: number;
    title: string;
    type: 'book' | 'article';
    authors?: string[];
    author?: string;
    publisher?: string;
    url?: string;
    year?: number;
    doi?: string;
};

@Injectable()
export class ResourcesService {
    constructor(
        @InjectRepository(TextualInformation)
        private readonly tiRepo: Repository<TextualInformation>,
        @InjectRepository(Book) private readonly bookRepo: Repository<Book>,
        @InjectRepository(Article) private readonly artRepo: Repository<Article>,
    ) {}

    async listAll(): Promise<ResourceDTO[]> {
        const tis = await this.tiRepo.find({ take: 100 });
        return this.hydrate(tis);
    }

    async findById(id: number) {
        const ti = await this.tiRepo.findOne({ where: { id } });
        if (!ti) return undefined;
        const [item] = await this.hydrate([ti]);
        return item;
    }

    async searchSimple(q: string, filters: any = {}): Promise<ResourceDTO[]> {
        const qb = this.tiRepo.createQueryBuilder('ti').where('ti.deleted_at IS NULL');

        if (q && q.trim()) {
            qb.andWhere('ti.title ILIKE :q', { q: `%${q}%` });
        }
        if (filters?.type) {
            qb.andWhere('ti.info_type = :t', { t: filters.type });
        }

        qb.take(100);
        const list = await qb.getMany();
        // scoring sau -> ở search repo
        return this.hydrate(list);
    }

    private async hydrate(tis: TextualInformation[]): Promise<ResourceDTO[]> {
        if (!tis.length) return [];
        const ids = tis.map((t) => t.id);

        const [books, arts] = await Promise.all([
            this.bookRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids }).getMany(),
            this.artRepo.createQueryBuilder('a').where('a.id IN (:...ids)', { ids }).getMany(),
        ]);

        const bmap = new Map(books.map((b) => [b.id, b]));
        const amap = new Map(arts.map((a) => [a.id, a]));

        return tis.map((t) => {
            if (t.info_type === TextualContentType.BOOK) {
                const b = bmap.get(t.id);
                return {
                    id: t.id,
                    title: t.title,
                    type: 'book',
                    author: b?.author,
                    publisher: b?.publisher,
                    url: t.source_url,
                    year: b?.publication_year,
                };
            } else {
                const a = amap.get(t.id);
                return {
                    id: t.id,
                    title: t.title,
                    type: 'article',
                    authors: a?.authors ? a.authors.split(',').map((s) => s.trim()) : [],
                    publisher: a?.publisher || undefined,
                    url: t.source_url,
                    doi: a?.doi,
                };
            }
        });
    }
}
