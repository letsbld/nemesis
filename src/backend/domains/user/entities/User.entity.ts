import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    first_name: string;

    @Column({ type: 'text', nullable: true })
    middle_name?: string;

    @Column({ type: 'text' })
    last_name: string;

    @Column({ type: 'text' })
    display_name: string;

    @Column({ type: 'text' })
    company_email: string;

    @Column({ type: 'text', nullable: true })
    alternate_email?: string;

    @Column({ type: 'text' })
    manager_name: string;

    @Column({ type: 'text', unique: true })
    username: string;

    @Column({ type: 'text' })
    password: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
