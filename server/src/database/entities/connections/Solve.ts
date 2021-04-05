import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Solve {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    team: number; // fk

    @Column()
    user: number; // fk

    @Column()
    challenge: number; // fk

    @Column()
    timestamp: number;

    constructor() {
        // TODO
    }
}
