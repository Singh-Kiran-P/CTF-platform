import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Sponsor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    link: string;

    @Column()
    name: string;

    @Column()
    icon: string;

    @Column()
    order: number;

    constructor(params?: { name: string, link: string, icon: string, order: number, id?: number }) {
        if (!params) return;
        this.id = params.id;
        this.name = params.name;
        this.link = params.link;
        this.icon = params.icon;
        this.order = params.order;
    }
}
