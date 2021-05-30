import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    msg: string

    @CreateDateColumn()
    createdAt: string;

    constructor(title: string, msg: string) {
        this.title = title;
        this.msg = msg;
    }
}
