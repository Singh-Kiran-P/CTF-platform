import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Challenge } from '../../../database';

@Entity()
export class Round {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    start: number;

    @Column()
    end: number;

    @OneToMany(_ => Challenge, challenge => challenge.round)
    challenges: Challenge[];

    constructor() {
        // TODO
    }
}
