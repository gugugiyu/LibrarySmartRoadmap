import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
} from 'typeorm';
import { Roadmap } from './roadmap.entity';
import { TextualInformation } from './textual_information.entity';

@Entity({ name: 'roadmap_nodes' })
export class RoadmapNode {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Roadmap, (r) => r.nodes, { nullable: false })
    roadmap: Roadmap;

    @ManyToOne(() => RoadmapNode, (n) => n.children, { nullable: true })
    parent: RoadmapNode | null;

    @OneToMany(() => RoadmapNode, (n) => n.parent)
    children: RoadmapNode[];

    @Column({ type: 'int' })
    order: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    title: string | null;

    @Column({ type: 'text', nullable: true })
    goal: string | null;

    @Column({ type: 'simple-json', nullable: true })
    keywords: string[] | null; // MVP

    @ManyToOne(() => TextualInformation, { nullable: true })
    info: TextualInformation | null; // default tài liệu (top-1)

    @Column({ type: 'boolean', default: false })
    is_completed: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    modified_at: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deleted_at?: Date | null;
}
