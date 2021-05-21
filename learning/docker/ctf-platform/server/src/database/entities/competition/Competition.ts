import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Competition {
    @PrimaryColumn()
    name: string;

    @Column()
    paused: boolean;

    @Column()
    flagFormat: string;

    constructor() {
        // TODO
    }
}
