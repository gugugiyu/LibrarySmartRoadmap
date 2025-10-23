import { Injectable } from "@nestjs/common"
import { VectorRepository, SearchHit } from "../types"
import { ResourcesService } from "../../resources/resources.service"

function jaccard(a: Set<string>, b: Set<string>): number {
    const inter = new Set([...a].filter(x => b.has(x))).size
    const union = new Set([...a, ...b]).size || 1
    return inter / union
}

@Injectable()
export class VectorRepo implements VectorRepository {
    constructor(private readonly resources: ResourcesService) {}

    async search(_embedding: number[], filters: any, limit: number): Promise<SearchHit[]> {
        const q = (filters?.__q || '').toString().toLowerCase()
        const qTokens = new Set<string>(q.split(/\s+/).filter(Boolean))
        const list = this.resources.searchSimple(q, filters)
        const scored = list.map(r => {
            const hay = (r.title + 'c' + (r.tags || []).join(' ')).toLowerCase()
            const rTokens = new Set<string>(hay.split(/\s+/).filter(Boolean))
            const score = jaccard(qTokens, rTokens) || 0.05
            return {id: r.id, score}
        }) 
        scored.sort((a, b) => b.score - a.score)
        return scored.slice(0, limit)
    }
}