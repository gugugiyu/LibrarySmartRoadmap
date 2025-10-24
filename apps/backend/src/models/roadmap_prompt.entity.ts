import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TextualInformation } from './textual_information.entity';

export enum SELF_ASSESSMENT_LEVEL {
    EXPERT = 'expert',
    HIGHLY_PROFICIENT = 'highly_proficient',
    ADVANCED = 'advanced',
    INTERMEDIATE = 'intermediate',
    BEGINNERS = 'beginners',
}

@Entity({ name: 'roadmap_prompts' })
export class RoadMapPrompt {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { nullable: false })
    user: User;

    @Column('varchar', { length: 100 })
    major: string;

    @Column('text')
    background: string;

    @Column({ type: 'enum', enum: SELF_ASSESSMENT_LEVEL, default: SELF_ASSESSMENT_LEVEL.BEGINNERS })
    self_assessment_level: SELF_ASSESSMENT_LEVEL;

    @Column({ type: 'float', default: 1 })
    daily_study_hours: number;

    @ManyToMany(() => TextualInformation)
    @JoinTable()
    has_previously_read: TextualInformation[];

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    modified_at: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deleted_at?: Date | null;
}
