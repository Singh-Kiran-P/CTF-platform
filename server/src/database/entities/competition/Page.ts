import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Page {
    @PrimaryColumn()
    path: string;

    @Column()
    name: string;

    @Column()
    source: string
    
    @Column()
    order: number;

    @Column()
    authentication: number; // TODO: enum? remove this?

    @Column()
    visibility: boolean; // TODO: remove this?

    constructor(name: string, path: string, source: string, order: number) {
        this.name = name;
        this.path = path;
        this.source = source;
        this.order = order;
        this.authentication = 0;
        this.visibility = true;
    }
}
