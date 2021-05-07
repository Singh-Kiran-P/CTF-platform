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
            <div v-for="item in notification" :key="item">
                <b-card class="card" bg-variant="dark"  text-variant="white" :title="item.title">

                    <b-card-text>
                        {{ item.msg }}
                    </b-card-text>
                    <template #footer>
                        <small class="text-muted">{{ item.createdAt }}</small>
                    </template>
                </b-card>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import Toast from "../assets/functions/toast";

export default Vue.extend({
    name: "Notifcations",
    created() {
        this.loadNotifications();
    },
    data: () => ({
        notification: [] as {
            id: number,
            title: string;
            msg: string;
            createdAt: String;
        }[],
        form: {
            title: "",
            msg: "",
        },
        show: true,
    }),
    mounted() {
        // setInterval(() => {
        //     this.loadNotifications();
        // }, 1000);
    },
    methods: {
        onSubmit(e: Event) {
            e.preventDefault();
            this.sendNotfication();
        },
        loadNotifications(): void {
            axios.get("/api/notification/getAll").then((response) => {
                let data = response.data;
                this.notification = [];
                data.forEach((item: any) => {
                    this.notification.push({
                        id : item.id,
                        title: item.title,
                        msg: item.msg,
                        createdAt: item.createdAt,
                    });
                });
            });
        },
        sendNotfication(): void {
            let axiosConfig = {
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                },
            };
            axios
                .post("/api/notification/send", this.form, axiosConfig)
                .then((response) => {
                    let data = response.data;
                    if (data.statusCode === 200) {
                        Toast.send(this, "Message", data.message, "success");
                    } else if (data.statusCode === 404)
                        Toast.send(this, "Message", data.message, "danger");
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

.card {
    margin-top: 20px;
}
</style>
