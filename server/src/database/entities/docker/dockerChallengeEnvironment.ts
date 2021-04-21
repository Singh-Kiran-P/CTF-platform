import { Column, CreateDateColumn, Entity, OneToOne, Unique, UpdateDateColumn } from "typeorm";
import { Challenge } from "../challenges/Challenge";

@Entity()
export class DockerChallengeEnvironment {
    @Column({ unique: true })
    id: number[]

    @Column({ unique: true })
    name: number

    @Column()
    ports: number[]


    @Column()
    size: number


    // TODO: DockerChallengeImage FK
    //@OneToOne(_ => DockerChallengeImage, DockerChallengeImage =>)

    @CreateDateColumn()
    createdAt: string

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: number

}
