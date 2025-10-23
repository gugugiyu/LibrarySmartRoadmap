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
import { Roadmap } from './roadmap.entity';
import { TextualInformation } from './textual_information.entity';

@Entity()
export class RoadmapNode {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => RoadmapNode, { nullable: true })
  parent_node_id: RoadmapNode;

  @OneToOne(() => Roadmap)
  @JoinColumn()
  roadmap_id: Roadmap;

  @Column()
  order: number;

  // List of resources
  @ManyToOne(() => TextualInformation)
  info_id: TextualInformation;

  @Column()
  isCompleted: boolean;

  @CreateDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  modified_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
