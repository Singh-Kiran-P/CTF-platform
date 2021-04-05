import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Page {
    @PrimaryColumn()
    route: string;

    @Column()
    title: string;

    @Column()
    htmlfile: string

    @Column()
    authentication: number; // enum? remove this?

    @Column()
    visibility: boolean;

    constructor() {
        // TODO
    }
}
