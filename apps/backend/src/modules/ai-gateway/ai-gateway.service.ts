import { Injectable } from "@nestjs/common"
import axios from 'axios'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AiGatewayService {
    private baseUrl: string
    
    constructor(private readonly config: ConfigService) {
        this.baseUrl = this.config.get<string>('AI_SERVICE_URL') || 'http://localhost:8000'
    }

    async embed(text: string): Promise<number[]> {
        try {
            const { data } = await axios.post(`${this.baseUrl}/embed`, { text }, { timeout: 5000 })
            if (data && Array.isArray(data.embedding)) {
                return data.embedding
            }
        } catch (_) {}
        // mock fallback
        return [0.1, 0.2, 0.3]
    }

    async generateNodes(payload: {
        subject: string
        background?: string
        level?: string
        readItems?: string[]
        pace?: string
    }): Promise<Array<{ id: string; order: number; keywords: string[]; goal: string; title?: string }>> {
        try {
            const { data } = await axios.post(`${this.baseUrl}/nodes`, payload, { timeout: 7000 })
            if (data && Array.isArray(data.nodes)) 
                return data.nodes
        } catch (_) {}
        return [
            { id: `st_${Date.now()}_1`, order: 1, keywords: ['khái niệm cơ bản', 'định nghĩa'], goal: 'nắm nền tảng' },
            { id: `st_${Date.now()}_2`, order: 2, keywords: ['bài tập nhập môn', 'ví dụ'], goal: 'luyện tập cơ bản' },
            { id: `st_${Date.now()}_3`, order: 3, keywords: ['kỹ thuật nâng cao'], goal: 'mở rộng kiến thức' },
            { id: `st_${Date.now()}_4`, order: 4, keywords: ['ứng dụng thực tế'], goal: 'vận dụng' },
        ]
    }
}