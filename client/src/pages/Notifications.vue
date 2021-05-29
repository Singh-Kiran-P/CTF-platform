<template>
    <div class=notifications>
        <div>
            <span class=notifications-title>Notifications</span>
            <b-form v-if="admin" class=create @submit="onSubmit($event)" required>
                <b-form-input v-model="form.title" placeholder="Enter notification title"  />
                <b-form-textarea v-model="form.msg" placeholder="Enter notification message" max-rows="10"/>
                <b-button type=submit variant=primary>Send</b-button>
            </b-form>
            <div class=show>
                <div class=notification v-for="item in notifications" :key="item.id">
                    <b-card class=card bg-variant=light>
                        <span class=notification-title>{{item.title}}</span>
                        <b-card-text>{{item.msg}}</b-card-text>
                        <small class=text-muted>{{item.createdAt}}</small>
                        <b-button v-if="admin" type=button variant=danger class=delete @click="deleteNotification(item.id)">Delete</b-button>
                    </b-card>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import Toast from "@/assets/functions/toast";

export default Vue.extend({
    name: "Notifcations",
    created() {
        this.loadNotifications();

        this.$socket.$subscribe("notification", (data: any) => {
            this.notifications.push(data);
        });

        this.$socket.$subscribe("notificationUpdate", (data: any) => {
            this.loadNotifications();
        });
    },
    data: () => ({
        notifications: [] as {
            id: number;
            title: string;
            msg: string;
            createdAt: String;
        }[],
        form: {
            title: '',
            msg: '',
        }
    }),
    computed: {
        admin(): boolean { return this.$route.meta.admin; }
    },
    methods: {
        onSubmit(e: Event) {
            e.preventDefault();
            this.sendNotfication();
            this.form = { title: '', msg: '' };
        },
        loadNotifications(): void {
            axios.get("/api/notification/getAll").then((response) => {
                let data = response.data;
                this.notifications = data;
            });
        },
        sendNotfication(): void {
            axios
                .post("/api/notification/send", this.form)
                .then((response) => {
                    let data = response.data;
                    if (data.statusCode === 200) {
                        Toast.send(this, "Message", data.message, "success");
                    } else if (data.statusCode === 404)
                        Toast.send(this, "Message", data.message, "danger");
                })
                .catch();
        },
        deleteNotification(id: number): void {
            axios
                .delete("/api/notification/deleteById", { data: { id: id } })
                .then((response) => {
                    let data = response.data;
                    if (data.statusCode === 200) {
                        Toast.send(this, "Message", data.message, "success");
                    } else if (data.statusCode === 404)
                        Toast.send(this, "Message", data.message, "danger");
                })
                .catch();

        },
    },
});
</script>

<style scoped lang="scss">
.notifications {
    display: flex;
    justify-content: center;
    overflow-y: scroll !important;
    padding: var(--double-margin);
    padding-bottom: 0;

    & > div {
        width: min(100%, var(--breakpoint-sm));
    }
}

.notifications-title {
    display: block;
    text-align: center;
    font-size: var(--font-massive);
}

.create {
    textarea, button {
        margin-top: var(--margin);
    }

    button {
        width: 100%;
    }
}

.show {
    border-top: 2px solid black;
    margin-top: var(--double-margin);
    padding-top: var(--double-margin);

    .notification {
        margin-bottom: var(--double-margin);

        .notification-title {
            font-weight: bold;
        }

        .delete {
            float: right;
        }
    }
}
</style>
