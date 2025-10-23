import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { TextualInformation } from './textual_information.entity';

@Entity()
export class Book extends TextualInformation {
  @Column('varchar', { unique: true })
  isbn: string;

  @Column()
  author: string;

  @Column()
  publisher: string;

  @Column()
  publication_year: number;
}
