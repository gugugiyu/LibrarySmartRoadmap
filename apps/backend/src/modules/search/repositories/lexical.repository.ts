import { Injectable } from "@nestjs/common"
import { LexicalRepository, SearchHit } from "../types"
import { ResourcesService } from "../../resources/resources.service"

@Injectable()
export class LexicalRepo implements LexicalRepository {
    constructor(private readonly resources: ResourcesService) {}

    async search(q: string, filters: any, limit: number): Promise<SearchHit[]> {
        const list = this.resources.searchSimple(q, filters)
        const tokens = (q || '').toLowerCase().split(/\s+/).filter(Boolean)
        const scored = list.map(resource => {
            const hay = (resource.title + ' ' + (resource.tags || []).join(' ')).toLowerCase()
            const matches = tokens.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0)
            return {id: resource.id, score: matches || 0.1}
        })
        scored.sort((a, b) => b.score - a.score)
        return scored.slice(0, limit)
    }
}