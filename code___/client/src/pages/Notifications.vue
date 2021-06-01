<template>
    <div class=notifications>
        <div>
            <span class=notifications-title>Notifications</span>
            <b-form v-if="admin" class=create @submit="onSubmit($event)" required>
                <b-form-input trim v-model="form.title" placeholder="Enter notification title" state @input="state= 'normal'"/>
                <b-form-textarea v-model="form.msg" placeholder="Enter notification message" max-rows="10" state @input="state= 'normal'"/>
                <StatusButton type=submit variant=primary normal=Send loading=Sending succes=Sent :state="state" :disabled="!input"/>
            </b-form>
            <div class=show>
                <span v-if="notifications.length == 0" class=empty>There are no notifications yet</span>
                <div class="list-item card" v-for="item in [...notifications].reverse()" :key="item.id">
                    <div class=content>
                        <span class=notification-title>{{item.title}}</span>
                        <span class=notification-message>{{item.msg}}</span>
                    </div>
                    <div class=footer>
                        <span>{{timeDisplay(item)}}</span>
                        <StatusButton v-if="admin" variant=danger normal=Delete loading=Deleting succes=Deleted :state="item.state" @click="deleteNotification(item)"/>
                    </div>
                </div>
                <div class=bottom-padding />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Toast from '@/assets/functions/toast';
import { timeDisplay } from '@/assets/functions/strings';
import StatusButton from '@/components/StatusButton.vue';

type Notification = {
    id: number,
    title: string,
    msg: string,
    createdAt: string,
    state: string
};

export default Vue.extend({
    name: 'Notifications',
    components: {
        StatusButton
    },
    created() {
        this.loadNotifications();
        this.$socket.$subscribe('notification', (data: any) => this.notifications.push(this.newNotification(data)));
        this.$socket.$subscribe('notificationUpdate', (data: any) => this.loadNotifications());
    },
    data: () => ({
        notifications: [] as Notification[],
        form: {
            title: '',
            msg: '',
        },
        state: 'normal'
    }),
    computed: {
        admin(): boolean { return this.$route.meta.admin; },
        input(): boolean { return this.form.title.length > 0 || this.form.msg.trim().length > 0; }
    },
    methods: {
        timeDisplay(notification: Notification): string { return timeDisplay(notification.createdAt); },
        onSubmit(e: Event): void {
            e.preventDefault();
            if (!this.input) return;
            this.sendNotfication();
        },

        loadNotifications(): void {
            const error = (err: string) => Toast.send(this, 'Message', err, 'danger');
            axios.get('/api/notification/getAll').then(response => {
                let data = response.data;
                if (data.statusCode == 404) error(data.message);
                else this.notifications = response.data.map((notification: any) => this.newNotification(notification));
            }).catch(err => error(err));;
        },
        sendNotfication(): void {
            this.state = 'loading';
            const error = () => this.state = 'error';
            axios.post('/api/notification/send', this.form).then(response => {
                let data = response.data;
                if (data.statusCode == 200) {
                    this.state = 'succes';
                    this.form = { title: '', msg: '' };
                }
                else error();
            }).catch(() => error());
        },
        deleteNotification(notification: Notification): void {
            notification.state = 'loading';
            const error = () => notification.state = 'error';
            axios.delete('/api/notification/deleteById', { data: { id: notification.id } }).then(response => {
                let data = response.data;
                if (data.statusCode == 200) this.state = 'succes';
                else error();
            }).catch(() => error());
        },

        newNotification(notification: Notification): Notification {
            return Object.assign({}, notification, { state: 'normal' });
        }
    }
});
</script>

<style scoped lang="scss">
@import '@/assets/css/listform.scss';

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
    font-size: var(--font-massive);
    margin-bottom: var(--margin);
}

.create {
    textarea, button {
        margin-top: var(--double-margin);
    }

    button {
        width: 100%;
    }
}

.show {
    border-top: var(--border-c) solid var(--black-c);
    padding-top: var(--margin);

    .empty {
        display: block;
        text-align: center;
    }

    .notification-title {
        font-weight: bold;
    }

    .notification-message {
        word-break: normal;
        white-space: pre-wrap;
    }
}
</style>
