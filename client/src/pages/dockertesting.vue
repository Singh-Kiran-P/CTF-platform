<template>
    <div>
        <h2>Images</h2>
        <div class="docker-planel">
            <b-table striped hover :items="images"></b-table>
        </div>
        <h2>Containers</h2>
        <div class="docker-planel">
            <b-table striped hover :items="containers"></b-table>
        </div>
        <div class="create">
            <h2>Config Ports</h2>
            <b-form
                @submit="onSubmit_configPort($event)"
                @reset="onReset_configPort($event)"
                v-if="show"
            >
                <b-form-group
                    id="input-group-1"
                    label="Upper Bound Port:"
                    label-for="input-1"
                    required
                >
                    <b-form-input
                        id="input-1"
                        v-model="form_configPorts.upperBoundPort"
                        type="Upper Bound Port:"
                        placeholder="Upper Bound Port"
                        required
                    ></b-form-input>
                </b-form-group>
                <b-form-group
                    id="input-group-1"
                    label="Lower Bound Port:"
                    label-for="input-1"
                    required
                >
                    <b-form-input
                        id="input-1"
                        v-model="form_configPorts.lowerBoundPort"
                        type="Lower Bound Port:"
                        placeholder="Lower Bound Port"
                        required
                    ></b-form-input>
                </b-form-group>

                <b-button type="submit" variant="primary">Update</b-button>
                <b-button type="reset" variant="danger">Reset</b-button>
            </b-form>
            <!-- <b-card class="mt-3" header="Form Data Result">
                <pre class="m-0">{{ form_configPorts }}</pre>
            </b-card> -->
        </div>
        <div class="create">
            <h2>Create Challenge for team!</h2>
            <b-form
                @submit="onSubmit_createChallenge($event)"
                @reset="onReset_createChallenge($event)"
                v-if="show"
            >
                <b-form-group
                    id="input-group-1"
                    label="Challenge Image:"
                    label-for="input-1"
                    required
                >
                    <b-form-input
                        id="input-1"
                        v-model="form_createChallenge.challengeImage"
                        type="Challenge Image:"
                        placeholder="Enter Image Name"
                        required
                    ></b-form-input>
                </b-form-group>
                <b-form-group
                    id="input-group-1"
                    label="Challenge Name:"
                    label-for="input-1"
                    required
                >
                    <b-form-input
                        id="input-1"
                        v-model="form_createChallenge.containerName"
                        type="Challenge Name"
                        placeholder="Enter Challenge Name"
                        required
                    ></b-form-input>
                </b-form-group>

                <b-button type="submit" variant="primary">Create</b-button>
                <b-button type="reset" variant="danger">Reset</b-button>
            </b-form>
            <!-- <b-card class="mt-3" header="Form Data Result">
        <pre class="m-0">{{ form_createChallenge }}</pre>
      </b-card> -->
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";

import axios from "axios";

export default Vue.extend({
    name: "DockerTesting",
    created() {
        this.getContainers();
        this.getImages();
        this.getConfigPorts();
    },
    data: () => ({
        containers: [] as {
            Name: string;
            Image: string;
            Ports: String;
            State: string;
            Status: string;
        }[],
        images: [] as {
            Name: string;
            Size: string;
        }[],
        form_createChallenge: {
            challengeImage: "",
            containerName: "",
        },
        form_configPorts: {
            upperBoundPort: "",
            lowerBoundPort: "",
        },
        show: true,
    }),

    methods: {
        onSubmit_createChallenge(e: Event) {
            e.preventDefault();
            this.createChallengeContainer();
        },
        onReset_createChallenge(e: Event) {
            e.preventDefault();
            // Reset our form values
            this.form_createChallenge.challengeImage = "";
            this.form_createChallenge.containerName = "";

            // Trick to reset/clear native browser form validation state
            this.show = false;
            this.$nextTick(() => {
                this.show = true;
            });
        },
        onSubmit_configPort(e: Event) {
            e.preventDefault();
            this.updateConfigPorts();
        },
        onReset_configPort(e: Event) {
            e.preventDefault();
            // Reset our form values
            this.form_configPorts.upperBoundPort = "";
            this.form_configPorts.lowerBoundPort = "";

            // Trick to reset/clear native browser form validation state
            this.show = false;
            this.$nextTick(() => {
                this.show = true;
            });
        },
        getContainers(): void {
            //TODO: Multiple ports
            axios.get("/api/docker/containers").then((response) => {
                let data = response.data;
                data.forEach((item: any) => {
                    this.containers.push({
                        Name: item.Names[0].slice(1),
                        Image: item.Image,
                        Ports: item.Ports[0].PublicPort,
                        State: item.State,
                        Status: item.Status,
                    });
                });
                console.log(data);
            });
        },
        getImages(): void {
            axios.get("/api/docker/images").then((response) => {
                let data = response.data;
                data.forEach((item: any) => {
                    this.images.push({
                        Name: item.RepoTags[0],
                        Size: (item.Size / Math.pow(10, 6)).toFixed(2) + " mb",
                    });
                });
            });
        },

        getConfigPorts(): void {
            axios.get("/api/docker/dockerConfigPorts").then((response) => {
                let data = response.data;
                this.form_configPorts.upperBoundPort = data.upperBoundPort;
                this.form_configPorts.lowerBoundPort = data.lowerBoundPort;
            });
        },
        updateConfigPorts(): void {
            let axiosConfig = {
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                },
            };
            axios
                .post(
                    "/api/docker/dockerConfigPorts",
                    {
                        upperBoundPort: this.form_configPorts.upperBoundPort,
                        lowerBoundPort: this.form_configPorts.lowerBoundPort,
                    },
                    axiosConfig
                )
                .then((response) => {
                    let data = response.data;
                    if (data.statusCode === 200) {
                        this.toast(data.message, "success");
                    } else if (data.statusCode === 404)
                        this.toast(data.message, "danger");
                });
        },
        createChallengeContainer(): void {
            let axiosConfig = {
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                },
            };
            axios
                .post(
                    "/api/docker/createChallengeContainer",
                    {
                        challengeImage: this.form_createChallenge
                            .challengeImage,
                        containerName: this.form_createChallenge.containerName,
                    },
                    axiosConfig
                )
                .then((response) => {
                    let data = response.data;
                    if (data.statusCode === 200) {
                        this.toast(data.message, "success");
                    } else if (data.statusCode === 404)
                        this.toast(data.message, "danger");
                });
        },
        toast(message: string, type: string, append = false) {
            this.$bvToast.toast(message, {
                title: "Message",
                toaster: "b-toaster-bottom-right",
                variant: type,
                solid: true,
                appendToast: append,
            });
        },
    },
});
</script>


<style scoped lang="scss">
.docker-planel {
    display: flex;
    justify-content: center;
    padding-bottom: 0;
    margin: 10px auto 20px auto;
    width: 60%;
}
h2 {
    display: flex;
    justify-content: center;
    padding-bottom: 0;
    margin: 10px auto 20px auto;
    width: 60%;
}
.create {
    margin: 50px auto 20px auto;
    width: 50%;
    border-top: 1px solid black;
}
</style>
