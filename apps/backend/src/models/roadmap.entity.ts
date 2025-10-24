import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
} from 'typeorm';
import { RoadMapPrompt } from './roadmap_prompt.entity';
import { User } from './user.entity';
import { RoadmapNode } from './roadmap_node.entity';

@Entity({ name: 'roadmaps' })
export class Roadmap {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => RoadMapPrompt, { nullable: false })
    @JoinColumn()
    prompt: RoadMapPrompt;

    @ManyToOne(() => User, { nullable: false })
    user: User;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @OneToMany(() => RoadmapNode, (n) => n.roadmap)
    nodes: RoadmapNode[];

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    modified_at: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deleted_at?: Date | null;
}
