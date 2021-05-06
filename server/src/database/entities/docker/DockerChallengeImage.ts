import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryColumn, Unique, UpdateDateColumn } from "typeorm";
import { Challenge } from "../challenges/Challenge";
import { DockerChallengeContainer } from "./DockerChallengeContainer";

@Entity()
export class DockerChallengeImage {
    @PrimaryColumn()
    name: string

    @Column("text", { array: true })
    innerPorts: string[];

    @OneToOne(() => Challenge, Challenge => Challenge.challengeImage,{nullable : true})
    challenge: Challenge

    // @OneToMany(() => DockerChallengeContainer, DockerChallengeContainer => DockerChallengeContainer.image,{nullable : true})
    // container: DockerChallengeContainer[]

    @Column()
    size: number

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: number;

    constructor(name:string , ports:string[],size:number) {
        this.name = name;
        this.innerPorts = ports;
        this.size = size;
    }
}
