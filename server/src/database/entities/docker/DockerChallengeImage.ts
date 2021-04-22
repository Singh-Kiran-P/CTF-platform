import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryColumn, Unique, UpdateDateColumn } from "typeorm";
import { Challenge } from "../challenges/Challenge";
import { DockerChallengeContainer } from "./DockerChallengeContainer";

@Entity()
export class DockerChallengeImage {
    @PrimaryColumn({ unique: true })
    id: number

    @Column({ unique: true })
    name: number

    @Column("int", { array: true })
    innerPorts: number[];

    @OneToOne(() => Challenge, Challenge => Challenge.challengeImage,{nullable : true})
    challenge: Challenge

    @OneToMany(() => DockerChallengeContainer, DockerChallengeContainer => DockerChallengeContainer.image,{nullable : true})
    container: DockerChallengeContainer[]

    @Column()
    size: number

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: number;
}
