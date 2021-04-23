import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Sponsor {
    @PrimaryColumn()
    link: string;

    @Column()
    icon: string;

    @Column()
    order: number;

    constructor(link: string, icon: string, order: number) {
        this.link = link;
        this.icon = icon;
        this.order = order;
    }
}
