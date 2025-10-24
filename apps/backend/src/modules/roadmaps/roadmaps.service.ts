import { Injectable } from '@nestjs/common';
import { AiGatewayService } from '../ai-gateway/ai-gateway.service';
import { SearchService } from '../search/search.service';
import { StepsService } from '../steps/steps.service';

type GenerateRoadmapInput = {
    subject: string;
    background?: string;
    level?: string;
    readItems?: string[];
    pace?: string;
};

type Roadmap = { id: string; subject: string; pace?: string };

@Injectable()
export class RoadmapsService {
    private store: Record<string, Roadmap> = {};

    constructor(
        private readonly ai: AiGatewayService,
        private readonly search: SearchService,
        private readonly steps: StepsService,
    ) {}

    private genId(prefix: string) {
        return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    async generate(input: GenerateRoadmapInput, userId: string) {
        const roadmapId = this.genId('rm');
        this.store[roadmapId] = { id: roadmapId, subject: input.subject, pace: input.pace };

        const nodes = await this.ai.generateNodes({
            subject: input.subject,
            background: input.background,
            level: input.level,
            readItems: input.readItems || [],
            pace: input.pace,
        });

        const steps = this.steps.createSteps(roadmapId, nodes);

        for (const st of steps) {
            const q = `${input.subject} ${st.keywords.join(' ')}`.trim(); // tăng tỉ lệ match
            const hits = await this.search.hybridSearch(userId, q, { subject: input.subject }, 10);
            const recs = hits.map((h, idx) => ({
                resourceId: h.id,
                rank: idx + 1,
                relevancy: Number((h.score ?? 0).toFixed(4)),
            }));
            this.steps.setRecommendations(st.id, recs);
            if (recs[0]) this.steps.setDefaultResource(st.id, recs[0].resourceId);
        }

        const total_est_time = steps.reduce((acc, s) => acc + (s.est_time || 60), 0);

        return {
            roadmapId,
            subject: input.subject,
            pace: input.pace || 'n/a',
            steps: this.steps.listByRoadmap(roadmapId).map((s) => ({
                id: s.id,
                order: s.order,
                title: s.title,
                keywords: s.keywords,
                goal: s.goal,
                est_time: s.est_time,
                defaultResourceId: s.defaultResourceId || null,
                recommendationsTop10Link: `/steps/${s.id}/recommendations?top_k=10`,
            })),
            timeline: { total_est_time },
        };
    }

    get(roadmapId: string) {
        const rm = this.store[roadmapId];
        if (!rm) return null;
        return { ...rm, steps: this.steps.listByRoadmap(roadmapId) };
    }
}
