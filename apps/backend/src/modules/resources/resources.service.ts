import { Injectable } from "@nestjs/common"

export type Resource = {
    id: string;
    title: string;
    authors ?: string[];
    type: 'book' | 'paper' | 'article' | 'video';
    source ?: string;
    url ?: string;
    pages ?: number;
    words ?: number;
    difficulty ?: 'beginner' | 'intermediate' | 'advanced';
    tags ?: string[];
}

@Injectable()
export class ResourcesService {
    private data: Resource[] = [
        {
            id: 'res_1',
            title: 'Xác suất cơ bản cho sinh viên năm nhất',
            type: 'book',
            pages: 180,
            difficulty: 'beginner',
            tags: ['xác suất', 'biến cố', 'quy tắc cộng', 'quy tắc nhân'],
            url: 'https://example.com/prob-basic',
        },
        {
            id: 'res_2',
            title: 'Bài tập nhập môn Xác suất',
            type: 'article',
            words: 6500,
            difficulty: 'beginner',
            tags: ['bài tập', 'xác suất', 'ví dụ']
        },
        {
            id: 'res_3',
            title: 'Kỹ thuật đếm và tổ hợp nâng cao',
            type: 'paper',
            words: 9000,
            difficulty: 'intermediate',
            tags: ['tổ hợp', 'đếm', 'xác suất'],
        },
        {
            id: 'res_4',
            title: 'Ứng dụng xác suất trong học máy',
            type: 'article',
            words: 8000,
            difficulty: 'advanced',
            tags: ['ứng dụng', 'học máy', 'bayes'],
        },
    ]

    listAll(): Resource[] {
        return this.data
    }

    findById(id: string): Resource | undefined {
        return this.data.find(resource => resource.id === id)
    }

    searchSimple(q: string, filters: any = {}): Resource[] {
        const query = (q || '').toLowerCase().trim()
        const tokens = query.split(/\s+/).filter(Boolean)

        return this.data.filter(resource => {
            const hay = (resource.title + ' ' + (resource.tags || []).join(' ')).toLowerCase()

            const hitPhrase = !query || hay.includes(query)
            const hitAnyToken = tokens.length === 0 || tokens.some(t => hay.includes(t))

            const okDifficulty = !filters?.difficulty || resource.difficulty === filters.difficulty
            const okType = !filters?.type || resource.type === filters.type

            return (hitPhrase || hitAnyToken) && okDifficulty && okType
        })
    }
}