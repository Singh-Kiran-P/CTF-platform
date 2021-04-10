<template>
    <div class=admin-panel>
        <b-form @submit="onSubmit">
            <b-form-group label="Competition name" label-for=competition-name>
                <b-form-input
                    type=text
                    id=competition-name
                    v-model="form.competitionName"
                    placeholder="Enter competition name"
                    required
                />
            </b-form-group>

            <b-form-group label="Participant categories" label-for=null>
                <div class=participant-category v-for="category in form.participantCategories" :key="category">
                    <span>{{category}}</span>
                    <span @click="removeParticipantCategory(category)">&nbsp;X</span>
                </div>
                <div class=add-participant-category>
                    <b-form-input
                        type=text
                        v-model="form.newParticipantCategory"
                        placeholder="Add a new category"
                        :state="addNewParticipantCategoryState"
                    />
                    <b-button type=button variant=primary @click="addParticipantCategory">Add</b-button>
                    <b-form-invalid-feedback>{{addNewParticipantCategoryFeedback}}</b-form-invalid-feedback>
                </div>
            </b-form-group>

            <b-button type=button variant=danger @click="onCancel">Cancel</b-button>
            <b-button type=submit variant=primary>Save</b-button>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'AdminPanel',
    created() {
        this.loadFormData();
    },
    data: () => ({
        form: {
            competitionName: '',
            participantCategories: [] as string[],
            challengeTags: [],
            newParticipantCategory: ''
        }
    }),
    methods: {
        loadFormData(): void {
            // TODO: load from database
            this.form.participantCategories = ['BACH 1', 'BACH 2', 'BACH 3', 'MAST 1', 'MAST 2'];
            this.form.newParticipantCategory = '';
        },
        onSubmit(e: Event): void {
            e.preventDefault();
            // TODO: store in database
        },
        onCancel(): void {
            this.loadFormData();
        },
        removeParticipantCategory(category: string) {
            this.form.participantCategories = this.form.participantCategories.filter(x => x != category);
        },
        addParticipantCategory() {
            if (!this.addNewParticipantCategoryState) return;
            this.form.participantCategories.push(this.newParticipantCategory);
            this.form.newParticipantCategory = '';
        }
    },
    computed: {
        newParticipantCategory(): string {
            return this.form.newParticipantCategory.trim()
        },
        addNewParticipantCategoryFeedback(): string {
            if (this.form.participantCategories.includes(this.newParticipantCategory))
                return 'Category already exists!';
            return '';
        },
        addNewParticipantCategoryState(): boolean {
            return this.addNewParticipantCategoryFeedback.length == 0;
        }
    }
});
</script>

<style scoped lang="scss">
.admin-panel {
    padding: 1rem;
}

.add-participant-category {
    display: flex;
    flex-wrap: wrap;
}

.add-participant-category input {
    width: initial;
    flex-grow: 1;
}

.add-participant-category button {
    width: initial;
    margin-left: 1rem;
}

button {
    width: calc(50% - 1rem / 2);
}

button.btn-danger {
    margin-right: 1rem;
}
</style>
