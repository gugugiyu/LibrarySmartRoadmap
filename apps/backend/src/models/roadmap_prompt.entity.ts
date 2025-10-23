import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TextualInformation } from './textual_information.entity';

export enum SELF_ACCESSMENT_LEVEL {
  EXPERT,
  HIGHLY_PROFICIENT,
  ADVANCED,
  INTERMEDIATE,
  BEGINNERS,
}

@Entity()
export class RoadMapPrompt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column('varchar', {
    length: 100,
    nullable: false,
  })
  major: string;

  @Column('text', { nullable: false })
  background: string;

  @Column('enum', {
    enum: SELF_ACCESSMENT_LEVEL,
    default: SELF_ACCESSMENT_LEVEL.BEGINNERS,
  })
  self_accessment_level: SELF_ACCESSMENT_LEVEL;

  @Column()
  daily_study_hours: number;

  @ManyToMany(() => TextualInformation)
  @JoinTable()
  has_previously_read: TextualInformation[];

  @CreateDateColumn()
  modified_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
