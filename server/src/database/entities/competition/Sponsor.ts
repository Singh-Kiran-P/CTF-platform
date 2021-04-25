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

    constructor(name: string, link: string, icon: string, order: number) {
        this.name = name;
        this.link = link;
        this.icon = icon;
        this.order = order;
    }
}
