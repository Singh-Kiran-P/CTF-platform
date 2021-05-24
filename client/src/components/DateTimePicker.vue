<template>
    <div class="date-time-picker">
        <span v-if="label">{{label}}</span>
        <div class=date-time>
            <b-form-datepicker v-model="date" :state="state" placeholder="Select date" @input="onInput()" no-highlight-today hide-header locale="en-GB"/>
            <b-form-timepicker v-model="time" :state="state" placeholder="Select time" @input="onInput()" no-close-button hide-header locale="nl-BE"/>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'DateTimePicker',
    props: {
        value: String,
        state: Boolean,
        label: String
    },
    data: () => ({
        date: '',
        time: ''
    }),
    computed: {
        v(): Date | null {
            return this.value ? new Date(this.value) : null;
        },
        dateValue(): string {
            return this.v ? `${this.d(4, this.v.getFullYear())}-${this.d(2, this.v.getMonth() + 1)}-${this.d(2, this.v.getDate())}` : '';
        },
        timeValue(): string {
            return this.v ? `${this.d(2, this.v.getHours())}:${this.d(2, this.v.getMinutes())}:${this.d(2, this.v.getSeconds())}` : '';
        },
        dateTime(): string {
            return this.date && this.time ? new Date(`${this.date}T${this.time}`).toJSON() : '';
        },
        changed(): boolean {
            return this.date != this.dateValue || this.time != this.timeValue;
        }
    },
    created() {
        this.setValue();
    },
    watch: {
        value(): void {
            this.setValue();
        }
    },
    methods: {
        d(n: number, v: number): string {
            let s = v.toString();
            while (s.length < n) s = '0' + s;
            return s;
        },
        onInput(): void {
            if (!this.changed) return;
            this.$emit('input', this.dateTime);
        },
        setValue(): void {
            if (!this.changed) return;
            this.date = this.dateValue;
            this.time = this.timeValue;
        }
    }
});
 
</script>

<style scoped lang="scss">
.date-time {
    width: 100%;
    display: inline-flex;
    flex-wrap: wrap;
}

.date-time > * {
    width: 0;
    flex-grow: 1;
}

.date-time > :first-of-type {
    margin-right: var(--margin);
}

$breakpoint-sm: 576px;
@media (max-width: $breakpoint-sm) {
    .date-time > * {
        width: 100%;
    }

    .date-time > :first-of-type {
        margin-right: 0;
        margin-bottom: var(--margin);
    }
}
</style>
