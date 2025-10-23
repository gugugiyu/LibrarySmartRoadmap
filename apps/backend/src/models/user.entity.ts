import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column('datetime', { nullable: false })
  enrollment_date: Date;

  @CreateDateColumn()
  modified_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
