import { Column, Entity, EntityRepository, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from "typeorm";
import { DockerOpenPort } from "./DockerOpenPort";

@Entity()
export class DockerManagement {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    lowerBoundPort: number

    @Column()
    upperBoundPort: number

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: number;

    constructor(upperBound: number, lowerBound: number) {
        this.lowerBoundPort = upperBound;
        this.upperBoundPort = lowerBound;

    }
}

@EntityRepository(DockerManagement)
export class DockerManagementRepo extends Repository<DockerManagement> {
    instance() {
       return this.findOne();
    }

    setUpperBoundPort(port: number) {
        return this.createQueryBuilder().update().set({ upperBoundPort: port }).execute();
    }

    setLowerBoundPort(port: number) {
        return this.createQueryBuilder().update().set({ lowerBoundPort: port }).execute();
    }
}

