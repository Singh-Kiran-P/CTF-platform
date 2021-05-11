import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, Unique, UpdateDateColumn } from "typeorm";
import { Challenge } from "../challenges/Challenge";
import { DockerChallengeImage } from "./DockerChallengeImage";

@Entity()
export class DockerChallengeContainer {
    @PrimaryColumn()
    name: string

    @Column("int", { array: true })
    ports: number[];

    @Column({ name: 'imageId' })
    imageId: string

    @ManyToOne(() => DockerChallengeImage,{ nullable: false })
    @JoinColumn({ name: "imageId" })
    image: DockerChallengeImage;

    @CreateDateColumn()
    createdAt: string

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: number

    constructor(name: string, ports: number[],  imageId: string) {
        this.name = name;
        this.ports = ports;
        this.imageId = imageId;

    }

}
