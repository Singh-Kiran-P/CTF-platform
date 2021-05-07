import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Challenge } from '../../../database';

@Entity()
export class Round {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    folder: string;

    @Column()
    start: string;

    @Column()
    end: string;

    @OneToMany(_ => Challenge, challenge => challenge.round)
    challenges: Challenge[];

    constructor(params?: { name: string, folder: string, start: string, end: string, id?: number }) {
        if (!params) return;
        this.id = params.id;
        this.name = params.name;
        this.folder = params.folder;
        this.start = params.start;
        this.end = params.end;
    }
}
