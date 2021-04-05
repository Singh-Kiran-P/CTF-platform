import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Attempt {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user: number; // fk

    @Column()
    team: number; // fk

    @Column()
    type: string; // enum

    @Column()
    timestamp: number;

    constructor() {
        // TODO
    }
}
