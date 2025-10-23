import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';

export enum TextualContentType {
  BOOK,
  ARTICLE,
}

@Entity()
export class TextualInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('varchar', { unique: true })
  source_url: string;

  @Column('enum', {
    enum: TextualContentType,
    nullable: false,
  })
  info_type: TextualContentType;

  @CreateDateColumn()
  crawled_at: Date;

  @CreateDateColumn()
  modified_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
