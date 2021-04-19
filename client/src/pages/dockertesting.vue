<template>
    <div>
        <div class="docker-planel">
            <b-table striped hover :items="containers"></b-table>
        </div>
        <div class="create">
            <h2>Create Challenge for team!</h2>
            <b-form
                @submit="onSubmit($event)"
                @reset="onReset($event)"
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
                        v-model="form_createChallenge.imageName"
                        type="Challenge Image:"
                        placeholder="Enter Image Name"
                        required
                    ></b-form-input>
                </b-form-group>
                <b-form-group
                    id="input-group-1"
                    label="Challenge Image:"
                    label-for="input-1"
                    required
                >
                    <b-form-input
                        id="input-1"
                        v-model="form_createChallenge.challengeName"
                        type="Challenge Name"
                        placeholder="Enter Challenge Name"
                        required
                    ></b-form-input>
                </b-form-group>

                <b-button type="submit" variant="primary">Create</b-button>
                <b-button type="reset" variant="danger">Reset</b-button>
            </b-form>
            <b-card class="mt-3" header="Form Data Result">
                <pre class="m-0">{{ form_createChallenge }}</pre>
            </b-card>
        </div>

        <div class="create">
            <h2>Create Challenge for team!</h2>
            <b-form
                @submit="onSubmit($event)"
                @reset="onReset($event)"
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
                        v-model="form_createChallenge.imageName"
                        type="Challenge Image:"
                        placeholder="Enter Image Name"
                        required
                    ></b-form-input>
                </b-form-group>
                <b-form-group
                    id="input-group-1"
                    label="Challenge Image:"
                    label-for="input-1"
                    required
                >
                    <b-form-input
                        id="input-1"
                        v-model="form_createChallenge.challengeName"
                        type="Challenge Name"
                        placeholder="Enter Challenge Name"
                        required
                    ></b-form-input>
                </b-form-group>

                <b-button type="submit" variant="primary">Create</b-button>
                <b-button type="reset" variant="danger">Reset</b-button>
            </b-form>
            <b-card class="mt-3" header="Form Data Result">
                <pre class="m-0">{{ form_createChallenge }}</pre>
            </b-card>
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
    },
    data: () => ({
        containers: [] as {
            Id: string;
            Name: string;
            Image: string;
            State: string;
            Status: string;
        }[],
        form_createChallenge: {
            imageName: "",
            challengeName: "",
        },
        show: true,
    }),

    methods: {
        onSubmit(e: Event) {
            e.preventDefault();
            this.createChallengeContainer();
        },
        onReset(e: Event) {
            e.preventDefault();
            // Reset our form values
            this.form_createChallenge.imageName = "";
            this.form_createChallenge.challengeName = "";

            // Trick to reset/clear native browser form validation state
            this.show = false;
            this.$nextTick(() => {
                this.show = true;
            });
        },
        getContainers(): void {
            axios.get("/api/docker/containers").then((response) => {
                let data = response.data;
                data.forEach((item: any) => {
                    this.containers.push({
                        Id: item.Id,
                        Name: item.Names[0].slice(1),
                        Image: item.Image,
                        State: item.State,
                        Status: item.Status,
                    });
                });
                console.log(data);
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
                        image: this.form_createChallenge.imageName,
                        containerName: this.form_createChallenge.challengeName,
                    },
                    axiosConfig
                )
                .then((response) => {
                    let data = response.data;
                    console.log(data);
                    if (data.statusCode === 200)
                        this.toast(data.message, "success");
                    else if (data.statusCode === 404)
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
    width: 80%;
}
.create {
    margin: 50px auto 20px auto;
    width: 50%;
    border-top: 1px solid black;
}
</style>
