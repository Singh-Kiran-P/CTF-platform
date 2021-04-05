import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Challenge {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sequence: number; // fk

    @Column()
    tag: number; // fk

    @Column()
    round: number; // fk

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    points: number;

    @Column()
    type: string; // enum

    @Column()
    flag: string;

    @Column()
    dockerfile: string; // string?

    @Column()
    visibility: boolean;

    constructor() {
        // TODO
    }
}
