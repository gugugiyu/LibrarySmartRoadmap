export type SearchHit = { id: string, score: number }

export interface LexicalRepository {
    search(q: string, filters: Record<string, any>, limit: number): Promise<SearchHit[]>
}

export interface VectorRepository {
    search(embedding: number[], filters: Record<string, any>, limit: number): Promise<SearchHit[]>
}