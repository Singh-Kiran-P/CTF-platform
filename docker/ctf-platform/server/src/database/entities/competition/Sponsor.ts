import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Sponsor {
    @PrimaryColumn()
    name: string;

    @Column()
    icon: string;

    @Column()
    link: string;

    constructor() {
        // TODO
    }
}
