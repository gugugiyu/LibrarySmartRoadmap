import { Entity, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';
import { TextualInformation } from './textual_information.entity';

@Entity({ name: 'book' })
export class Book {
    @PrimaryColumn()
    id: number; // shared PK vs textual_information.id

    @OneToOne(() => TextualInformation, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id' })
    base: TextualInformation;

    @Column({ type: 'text', default: '' })
    abstract: string;

    @Column({ type: 'varchar', length: 32, unique: true })
    isbn: string;

    @Column({ type: 'varchar', length: 255 })
    author: string;

    @Column({ type: 'varchar', length: 255 })
    publisher: string;

    @Column({ type: 'int' })
    publication_year: number;
}
