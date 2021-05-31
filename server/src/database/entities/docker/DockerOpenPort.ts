import { CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

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
