import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { TextualInformation } from './textual_information.entity';

@Entity()
export class Article extends TextualInformation {
  @Column('varchar')
  journal_name: string;

  @Column('varchar', { unique: true })
  doi: string;

  @Column('text')
  authors: string;

  @Column()
  publisher: string;

  @Column('datetime')
  publication_date: number;
}
