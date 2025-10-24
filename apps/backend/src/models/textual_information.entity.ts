import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';

export enum TextualContentType {
    BOOK = 'book',
    ARTICLE = 'article',
}

@Entity({ name: 'textual_information' })
export class TextualInformation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 500 })
    title: string;

    @Column({ type: 'varchar', length: 1024, unique: true })
    source_url: string;

    @Column({ type: 'enum', enum: TextualContentType })
    info_type: TextualContentType;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    modified_at: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deleted_at?: Date | null;
}
