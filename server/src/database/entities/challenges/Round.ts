import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Challenge } from '../../../database';

@Entity()
export class Round {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    start: string;

    @Column()
    end: string;

    @OneToMany(_ => Challenge, challenge => challenge.round)
    challenges: Challenge[];

    constructor(name: string, start: string, end: string) {
        this.name = name;
        this.start = start;
        this.end = end;
    }
}
