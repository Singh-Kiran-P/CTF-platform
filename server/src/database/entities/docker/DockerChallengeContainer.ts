import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Challenge } from "../challenges/Challenge";

@Entity()
export class DockerChallengeContainer {
    @PrimaryColumn()
    name: string

    @Column("int", { array: true })
    ports: number[];

    @ManyToOne(() => Challenge,{ nullable: false })
    @JoinColumn({ name: "dockerImageId" })
    image: Challenge;

    @CreateDateColumn()
    createdAt: string

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: number

    constructor(name: string, ports: number[],  imageId: string) {
        this.name = name;
        this.ports = ports;
        //this.imageId = imageId;
        // TODO: challenge instead of challengeimage
    }

}
