import { Inject, Injectable } from "@nestjs/common"
import { LexicalRepository, SearchHit, VectorRepository } from "./types"
import { AiGatewayService } from '../ai-gateway/ai-gateway.service'

@Injectable()
export class SearchService {
    constructor(
        @Inject('LexicalRepository') private readonly lex: LexicalRepository,
        @Inject('VectorRepository') private readonly vec: VectorRepository,
        private readonly ai: AiGatewayService,
    ) {}

    async hybridSearch(userId: string | null, query: string, filters: any = {}, k = 10) {
        const emb = await this.ai.embed(query)
        const limit = Math.max(k * 3, 10)
        const [lexHits, vecHits] = await Promise.all([
            this.lex.search(query, filters, limit),
            this.vec.search(emb, {...filters, __q: query}, limit),
        ])
        const nlex = this.normalize(lexHits)
        const nvec = this.normalize(vecHits)
        const fused = this.weightedSum(nlex, nvec, {wv: 0.55, wl: 0.45, alpha: 0})
        return fused.slice(0, k)
    }
    
    private normalize(hits: SearchHit[], eps = 1e-9): SearchHit[] {
        if (!hits.length) return hits
        const scores = hits.map(h => h.score)
        const min = Math.min(...scores), max = Math.max(...scores)
        const range = Math.max(max - min, eps)
        return hits.map(h => ({ ...h, score: (h.score - min) / range }))
    }

    private weightedSum(lex: SearchHit[], vec: SearchHit[], opts: { wv: number; wl: number; alpha: number }) {
        const map = new Map<string, { lex?: number; vec?: number }>()
        for (const h of lex) map.set(h.id, { ...(map.get(h.id) || {}), lex: h.score })
        for (const h of vec) map.set(h.id, { ...(map.get(h.id) || {}), vec: h.score })
        const fused = Array.from(map.entries()).map(([id, s]) => {
            const sv = s.vec ?? 0
            const sl = s.lex ?? 0
            const score = opts.wv * sv + opts.wl * sl + opts.alpha * 0
            return {id, score}
        })
        fused.sort((a, b) => b.score - a.score)
        return fused
    }                
}