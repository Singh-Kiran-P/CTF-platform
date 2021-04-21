import { Column, Entity } from "typeorm";

@Entity()
export class DockerManagement {
    @Column()
    openPorts: number[]

    @Column()
    underBoundPort: number

    @Column()
    upperBoundPort: number
}
