<template>
    <div v-if="true" class="docker">
        <div class="ports">
            <span>Ports</span>
            <Tooltip
                below
                class="info-tooltip"
                content="
                    Ports for interactive environments will be assigned within this range<br/><br/>
                    Adding exluded ports will prevent them from being assigned, you cannot undo this"
            >
                <font-awesome-icon icon="info-circle" />
            </Tooltip>
            <label
                >Lower bound port
                <b-input
                    type="number"
                    number
                    v-model="lowerbound"
                    :state="portState"
                    placeholder="Enter lower bound port"
                    @input="portInput()"
                />
            </label>
            <label
                >Upper bound port
                <b-input
                    type="number"
                    number
                    v-model="upperbound"
                    :state="portState"
                    placeholder="Enter upper bound port"
                    @input="portInput()"
                />
            </label>
            <label
                >Add excluded ports
                <b-input
                    type="text"
                    trim
                    v-model="excluded"
                    :state="portState"
                    placeholder="Enter excluded ports to be added"
                    @input="portInput()"
                />
                <span
                    >Multiple ports should be seperated with a comma, for
                    example: '8080, 900'</span
                >
            </label>
            <b-form-invalid-feedback :state="state(validatePorts)">{{
                validatePorts
            }}</b-form-invalid-feedback>
            <div class="buttons">
                <StatusButton
                    variant="danger"
                    normal="Cancel"
                    loading="Loaded"
                    succes="Loaded"
                    :state="cancelState"
                    @click="cancelPorts()"
                    :disabled="cancelDisabled"
                />
                <StatusButton
                    variant="primary"
                    normal="Save"
                    loading="Saving"
                    succes="Saved"
                    :state="saveState"
                    @click="savePorts()"
                    :disabled="saveDisabled"
                />
            </div>
        </div>
        <span class="info">
            A simple overview of your docker is provided below, for more control
            you can use
            <Tooltip
                center
                below
                content="Portainer is a third party docker manager"
                class="link-tooltip"
            >
                <a :href="`${domain}:9000`" target="_blank">Portainer</a>
            </Tooltip>
        </span>
        <div class="images">
            <label>Images</label>
            <Tooltip
                below
                content="Images running on the docker host engine<br><br>Interactive challenge image names are formatted like:<br>roundIndex-challengeOrder-timestamp"
                class="info-tooltip"
            >
                <font-awesome-icon icon="info-circle" />
            </Tooltip>
            <b-table
                fixed
                striped
                :fields="imageFields"
                :items="images"
                :busy="loadingImages"
            >
                <template v-slot:cell(delete)="row">
                    <StatusButton
                        variant="danger"
                        size="sm"
                        normal="Delete"
                        loading="Deleting"
                        succes="Deleted"
                        :state="row.item.deleting"
                        @click="deleteImage(row.item)"
                    />
                </template>
                <template #table-busy>
                    <div class="text-center text-primary">
                        <b-spinner variant="primary" label="Loading" />
                    </div>
                </template>
            </b-table>
        </div>
        <div class="containers">
            <label>Containers</label>
            <Tooltip
                below
                content="Container running on the docker host engine<br><br>Interactive challenge container names are formatted like:<br>challengeId-teamId-timestamp"
                class="info-tooltip"
            >
                <font-awesome-icon icon="info-circle" />
            </Tooltip>
            <b-table
                fixed
                striped
                :fields="containerFields"
                :items="containers"
                :busy="loadingContainers"
            >
                <template v-slot:cell(ports)="row">
                    <template v-for="(port, i) in row.item.ports">
                        <a
                            :key="port"
                            :href="`${domain}:${port}`"
                            target="_blank"
                            >{{ port }}</a
                        >{{ i == row.item.ports.length - 1 ? "" : ", " }}
                    </template>
                </template>
                <template v-slot:cell(delete)="row">
                    <StatusButton
                        variant="danger"
                        size="sm"
                        normal="Delete"
                        loading="Deleting"
                        succes="Deleted"
                        :state="row.item.deleting"
                        @click="deleteContainer(row.item)"
                    />
                </template>
                <template #table-busy>
                    <div class="text-center text-primary">
                        <b-spinner variant="primary" label="Loading" />
                    </div>
                </template>
            </b-table>
        </div>
        <div class="bottom-padding" />
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import Tooltip from "@/components/Tooltip.vue";
import StatusButton from "@/components/StatusButton.vue";
import { validateNumber, state } from "@shared/validation";
import { shortTimeDisplay } from "@/assets/functions/strings";
import { portsb } from "@/assets/functions/ports";
import toast from "@/assets/functions/toast";

type Container = {
    name: string;
    image: string;
    ports: number[];
    state: string;
    status: string;
    deleting: string;
};

type Image = {
    name: string;
    size: string;
    created: string;
    deleting: string;
    id: string;
};

export default Vue.extend({
    name: "Docker",
    components: {
        StatusButton,
        Tooltip,
    },
    created() {
        this.getContainers();
        this.getImages();
        this.cancelPorts();
    },
    data: () => ({
        images: [] as Image[],
        containers: [] as Container[],
        loadingImages: false,
        loadingContainers: false,

        imageFields: [
            { key: "name", sortable: true },
            { key: "size", sortable: true },
            { key: "created", sortable: true },
            { key: "delete", sortable: false },
        ],
        containerFields: [
            { key: "name", sortable: true },
            { key: "image", sortable: true },
            { key: "ports", sortable: true },
            { key: "state", sortable: true },
            { key: "status", sortable: true },
            { key: "delete", sortable: false },
        ],

        upperbound: NaN,
        lowerbound: NaN,
        excluded: "",

        portState: true,
        saveState: "normal",
        cancelState: "normal",

        domain: window.location.origin,
    }),
    computed: {
        empty(): boolean {
            return !this.lowerbound || !this.upperbound;
        },
        cancelDisabled(): boolean {
            return this.empty;
        },
        saveDisabled(): boolean {
            return this.empty || !state(this.validatePorts);
        },
        validatePorts(): string {
            let minPort = 1000;
            let maxPort = Math.pow(2, 16) - 1;
            let v = validateNumber(
                this.lowerbound,
                "Lower bound",
                false,
                minPort,
                maxPort
            );
            if (!v)
                v = validateNumber(
                    this.upperbound,
                    "Upper bound",
                    false,
                    this.lowerbound,
                    maxPort
                );
            if (!v && this.excluded)
                v = this.excluded
                    .split(",")
                    .map((p) => p.trim())
                    .reduce(
                        (acc, cur) =>
                            acc +
                            validateNumber(
                                Number.parseInt(cur),
                                "Excluded ports",
                                false,
                                1,
                                maxPort
                            ),
                        ""
                    );
            return v;
        },
    },
    methods: {
        state,
        portInput(): void {
            this.saveState = "normal";
            this.cancelState = "normal";
        },

        cancelPorts(): void {
            this.cancelState = "loading";
            const error = () => (this.cancelState = "error");
            axios
                .get("/api/docker/dockerConfigPorts")
                .then((res) => {
                    if (!res.data) return error();
                    this.excluded = "";
                    this.lowerbound = Number(res.data.lowerBoundPort);
                    this.upperbound = Number(res.data.upperBoundPort);
                    this.cancelState = "succes";
                })
                .catch(() => error());
        },
        savePorts(): void {
            this.saveState = "loading";
            const error = () => (this.saveState = "error");
            let bounds = axios.post("/api/docker/dockerConfigPorts", {
                lowerBoundPort: this.lowerbound.toString(),
                upperBoundPort: this.upperbound.toString(),
            });
            let exclude = axios.post("/api/docker/usedPorts", {
                ports: this.excluded,
            });
            Promise.all([bounds, exclude])
                .then(([res1, res2]) => {
                    if (
                        res1.data.statusCode == 404 ||
                        res2.data.statusCode == 404
                    )
                        return error();
                    this.saveState = "succes";
                    this.excluded = "";
                })
                .catch(() => error());
        },

        getImages(): void {
            this.loadingImages = true;
            axios
                .get("/api/docker/images")
                .then((res) => {
                    this.loadingImages = false;
                    if (!res.data) return;
                    this.images = res.data.map((item: any) => ({
                        name: item.RepoTags[0],
                        size:
                            (item.Size / Math.pow(1024, 2)).toFixed(2) + " mb",
                        created: shortTimeDisplay(
                            new Date(item.Created * 1000).toJSON()
                        ),
                        deleting: "normal",
                        id: item.Id
                    }));
                })
                .catch(() => (this.loadingImages = false));
        },
        getContainers(): void {
            this.loadingContainers = true;
            axios
                .get("/api/docker/containers")
                .then((res) => {
                    this.loadingContainers = false;
                    if (!res.data) return;
                    let prefix = "sha256:";
                    this.containers = res.data.map((item: any) => ({
                        name: item.Names[0].slice(1),
                        image: item.Image.startsWith(prefix) ? item.Image.slice(prefix.length) : item.Image,
                        ports: portsb(item.Ports),
                        state: item.State,
                        status: item.Status,
                        deleting: "normal",
                    }));
                })
                .catch(() => (this.loadingContainers = false));
        },

        deleteImage(image: any): void {
            image.deleting = "loading";
            const error = () => (image.deleting = "error");

            axios
                .post("/api/docker/deleteImage", { name: image.id })
                .then((response) => {
                    let data = response.data;
                    if (data.statusCode == 200) {
                        image.deleting = "succes";
                        this.getImages();
                    } else {
                        toast.send(this, "Message", data.message, "danger");
                        image.deleting = "error";
                        error();
                    }
                })
                .catch(() => error());
        },
        deleteContainer(container: any): void {
            container.deleting = "loading";
            const error = () => (container.deleting = "error");

            axios
                .post("/api/docker/deleteContainer", { name: container.name })
                .then((response) => {
                    let data = response.data;
                    if (data.statusCode == 200) {
                        container.deleting = "succes";
                        this.getContainers();
                    } else {
                        toast.send(this, "Message", data.message, "danger");
                        container.deleting = "error";
                        error();
                    }
                })
                .catch(() => error());
        },
    },
});
</script>

<style scoped lang="scss">
.docker {
    display: flex;
    align-items: center;
    overflow-y: scroll !important;
    padding: var(--double-margin);
    flex-direction: column;
    padding-bottom: 0;

    .ports {
        width: min(100%, var(--breakpoint-sm));
    }

    .images {
        width: min(100%, var(--breakpoint-md));
    }

    .containers {
        width: min(100%, var(--breakpoint-lg));
    }
}

.info-tooltip {
    color: var(--info);
    display: inline-block;
    margin-left: var(--margin);
}

.link-tooltip {
    display: inline-block;
}

.info {
    margin-bottom: var(--margin);
    margin-top: var(--double-margin);

    a {
        font-weight: bold;
    }
}

.ports > span,
.images > label,
.containers > label {
    font-weight: bold;
    font-size: var(--font-large);
    margin-bottom: var(--margin);
}

label span {
    font-size: var(--font-small);
}

.ports {
    label {
        display: block;
    }

    .buttons {
        display: flex;
        margin-top: var(--double-margin);

        button {
            width: 0;
            flex-grow: 1;

            &:first-of-type {
                margin-right: var(--double-margin);
            }
        }
    }
}
</style>
