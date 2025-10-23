import { Injectable } from '@nestjs/common'

export type Step = {
    id: string
    roadmapId: string
    order: number
    title?: string
    keywords: string[]
    goal?: string
    est_time?: number
    defaultResourceId?: string
}

export type StepRecommendation = { resourceId: string; rank: number; relevancy: number }

@Injectable()
export class StepsService {
    private steps: Step[] = []
    private recs: Record<string, StepRecommendation[]> = {}

    createSteps(roadmapId: string, nodes: Array<{ id: string; order: number; keywords: string[]; goal?: string; title?: string }>) {
        const created: Step[] = nodes.map(n => ({
            id: n.id,
            roadmapId,
            order: n.order,
            keywords: n.keywords,
            goal: n.goal,
            title: n.title || n.keywords.join(' / '),
            est_time: 60,
        }))
        this.steps.push(...created)
        return created
    }

    setRecommendations(stepId: string, list: StepRecommendation[]) {
        this.recs[stepId] = list
    }

    getRecommendations(stepId: string, topK = 10) {
        const arr = this.recs[stepId] || []
        return arr.slice(0, topK)
    }

    setDefaultResource(stepId: string, resId: string) {
        const s = this.steps.find(x => x.id === stepId)
        if (s) s.defaultResourceId = resId
    }

    listByRoadmap(roadmapId: string) {
        return this.steps.filter(s => s.roadmapId === roadmapId).sort((a, b) => a.order - b.order)
    }

    findById(id: string) {
        return this.steps.find(s => s.id === id)
    }
}