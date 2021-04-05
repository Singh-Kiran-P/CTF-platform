import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Attachment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    challenge: number; // fk

    @Column()
    filename: string;

    constructor() {
        // TODO
    }
}
