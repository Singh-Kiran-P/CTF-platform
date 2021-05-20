import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Challenge } from './Challenge';

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @OneToMany(_ => Challenge, challenge => challenge.tag)
    challenges: Challenge[];

    constructor() {
        // TODO
    }
}
