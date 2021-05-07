<template>
    <div>
        <div class="create">
            <h2>Notifications</h2>
            <b-form @submit="onSubmit($event)" v-if="show">
                <b-form-group
                    id="input-group-1"
                    label="Title:"
                    label-for="input-1"
                    required
                >
                    <b-form-input
                        id="input-1"
                        v-model="form.title"
                        placeholder=""
                        required
                    ></b-form-input>
                </b-form-group>
                <b-form-group
                    id="input-group-1"
                    label="Message:"
                    label-for="input-1"
                    required
                >
                    <b-form-textarea
                        id="textarea-formatter"
                        v-model="form.msg"
                        placeholder="Type hier your message"
                        :formatter="formatter"
                        rows="4"
                    ></b-form-textarea>
                </b-form-group>

                <b-button type="submit" variant="primary">Send</b-button>
            </b-form>
        </div>
        <!-- Notifications -->
        <div class="create">
            <b-card bg-variant="white" title="Card Title">
                <b-card-text>
                    With supporting text below as a natural lead-in to
                    additional content.
                </b-card-text>
                <template #footer>
                    <small class="text-muted">May 6th, 1:27:08 PM</small>
                </template>
            </b-card>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import PushNotification from "../components/PushNotification.vue";

export default Vue.extend({
    name: "Notifcations",
    created() {
        this.loadNotifications();
    },
    data: () => ({
        notification: [] as {
            Title: string;
            Msg: string;
            date_time: String;
        }[],
        form: {
            title: "",
            msg: "",
        },
        show: true,
    }),
    methods: {
        onSubmit(e: Event) {
            e.preventDefault();
            this.sendNotfication();
        },
        loadNotifications(): void {
            //TODO: Multiple ports
            axios.get("/api/docker/containers").then((response) => {});
        },
        sendNotfication(): void {
            let axiosConfig = {
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                },
            };
            axios
                .post("/api/docker/dockerConfigPorts", {}, axiosConfig)
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
    padding-top: 20px;
    margin: 50px auto 20px auto;
    width: 50%;
    border-top: 1px solid black;
}
</style>
