import { Column, CreateDateColumn, Entity, OneToOne, Unique, UpdateDateColumn } from "typeorm";
import { Challenge } from "../challenges/Challenge";

@Entity()
export class DockerChallengeImage {
    @Column({ unique: true })
    id: number[]

    @Column({ unique: true })
    name: number

    @Column()
    innerPorts: number

    // TODO: Challenge FK
    //@OneToOne(_ => Challenge, challenge =>)

    @Column()
    size: number

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: number;

}
