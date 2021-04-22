import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DockerManagement } from "./DockerManagement";

@Entity()
export class DockerOpenPort {
    @PrimaryColumn()
    openPorts: number;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: number;

    constructor(port:number){
        this.openPorts = port;
    }
}
