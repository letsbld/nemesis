import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('user_passkeys')
export class UserPasskey {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('int')
    userId: number;

    @Column('varchar', { length: 255 })
    credentialId: string;

    @Column('text')
    publicKey: string;

    @Column('bigint')
    counter: number;

    @Column('text', { nullable: true })
    transports?: string; // JSON string of transport methods

    @Column('varchar', { length: 255, nullable: true })
    name?: string; // User-friendly name for the passkey

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('timestamp', { nullable: true })
    lastUsed?: Date;
}
