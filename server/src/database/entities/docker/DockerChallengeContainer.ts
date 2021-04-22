import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryColumn, Unique, UpdateDateColumn } from "typeorm";
import { Challenge } from "../challenges/Challenge";
import { DockerChallengeImage } from "./DockerChallengeImage";

@Entity()
export class DockerChallengeContainer {
    @PrimaryColumn({ unique: true })
    id: string

    @Column({ unique: true })
    name: string

    @Column("int", { array: true })
    ports: number[];

    @Column("float")
    size: number

    @ManyToOne(_ => DockerChallengeImage, DockerChallengeImage => DockerChallengeImage.container)
    image: DockerChallengeImage

    @CreateDateColumn()
    createdAt: string

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: number

}
