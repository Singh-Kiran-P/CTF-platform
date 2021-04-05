import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Environment {
    @PrimaryColumn()
    emvironment: number;

    @Column()
    team: number; // fk

    @Column()
    challenge: number; // fk

    constructor() {
        // TODO
    }
}
