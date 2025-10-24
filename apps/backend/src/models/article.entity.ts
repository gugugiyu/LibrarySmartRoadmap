import { Entity, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';
import { TextualInformation } from './textual_information.entity';

@Entity({ name: 'article' })
export class Article {
    @PrimaryColumn()
    id: number; // shared PK với textual_information.id

    @OneToOne(() => TextualInformation, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id' })
    base: TextualInformation;

    @Column({ type: 'varchar', length: 255 })
    journal_name: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    doi: string;

    @Column({ type: 'text' })
    authors: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    publisher: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    publication_date: Date | null;
}
