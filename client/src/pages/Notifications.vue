<template>
    <div class="notifications">
        <div>
            <span class="notifications-title">Notifications</span>
            <b-form
                v-if="admin"
                class="create"
                @submit="onSubmit($event)"
                required
            >
                <b-form-input
                    v-model="form.title"
                    placeholder="Enter notification title"
                />
                <b-form-textarea
                    v-model="form.msg"
                    placeholder="Enter notification message"
                    max-rows="10"
                />
                <b-button type="submit" variant="primary">Send</b-button>
            </b-form>
            <div class="show">
                <div
                    class="list-item card"
                    v-for="item in [...notifications].reverse()"
                    :key="item.id"
                >
                    <div class="content">
                        <span class="notification-title">{{ item.title }}</span>
                        <span>{{ item.msg }}</span>
                    </div>
                    <div class="footer">
                        <span>{{ timeDisplay(item) }}</span>
                        <b-button
                            v-if="admin"
                            type="button"
                            variant="danger"
                            @click="deleteNotification(item.id)"
                            >Delete</b-button
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import Toast from "@/assets/functions/toast";
import { timeDisplay } from "@/assets/functions/strings";

type Notification = {
    id: number;
    title: string;
    msg: string;
    createdAt: string;
};

export default Vue.extend({
    name: "Notifications",
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
        notifications: [] as Notification[],
        form: {
            title: "",
            msg: "",
        },
    }),
    computed: {
        admin(): boolean {
            return this.$route.meta.admin;
        },
    },
    methods: {
        timeDisplay(notification: Notification): string {
            return timeDisplay(notification.createdAt);
        },

        onSubmit(e: Event): void {
            e.preventDefault();
            this.sendNotfication();
        },
        loadNotifications(): void {
            const error = (err: string) =>
                Toast.send(this, "Message", err, "danger");
            axios
                .get("/api/notification/getAll")
                .then((response) => {
                    let data = response.data;
                    if (data.statusCode == 200)
                        this.notifications = response.data;
                    // else error(data.message);
                })
                .catch((err) => error(err));
        },
        sendNotfication(): void {
            const error = (err: string) =>
                Toast.send(this, "Message", err, "danger");

            if (this.form.title.length == 0) {
                error("Notification cannot be empty!");
                return;
            }
            if (this.form.msg.length == 0) {
                error("Notification cannot be empty!");
                return;
            }

            axios
                .post("/api/notification/send", this.form)
                .then((response) => {
                    let data = response.data;
                    if (data.statusCode == 200) {
                        Toast.send(this, "Message", data.message, "success");
                        this.form = { title: "", msg: "" };
                    } else error(data.message);
                })
                .catch((err) => error(err));
        },
        deleteNotification(id: number): void {
            const error = (err: string) =>
                Toast.send(this, "Message", err, "danger");
            axios
                .delete("/api/notification/deleteById", { data: { id: id } })
                .then((response) => {
                    let data = response.data;
                    if (data.statusCode == 200)
                        Toast.send(this, "Message", data.message, "success");
                    else error(data.message);
                })
                .catch((err) => error(err));
        },
    },
});
</script>

<style scoped lang="scss">
@import "@/assets/css/listform.scss";

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
    textarea,
    button {
        margin-top: var(--margin);
    }

    button {
        width: 100%;
    }
}

.show {
    border-top: 2px solid var(--black);
    padding-top: var(--double-margin);

    .notification-title {
        font-weight: bold;
    }
}
</style>
