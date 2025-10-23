import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { RoadMapPrompt } from './roadmap_prompt.entity';
import { User } from './user.entity';

@Entity()
export class Roadmap {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => RoadMapPrompt)
  @JoinColumn()
  prompt_id: RoadMapPrompt;

  @ManyToOne(() => User)
  user: User;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @CreateDateColumn()
  modified_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
