import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Page {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    path: string;

    @Column()
    name: string;

    @Column()
    source: string;
    
    @Column()
    order: number;

    constructor(params?: { name: string, path: string, source: string, order: number, id?: number }) {
        if (!params) return;
        this.id = params.id;
        this.name = params.name;
        this.path = params.path;
        this.source = params.source;
        this.order = params.order;
    }
}
