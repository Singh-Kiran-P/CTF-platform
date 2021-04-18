<template>
    <div class=admin-panel>
        <b-form @submit="onSubmit($event)">
            <b-form-group variant=dark type=dark>
                <label for=competition-name>Competition name</label>
                <b-form-input
                    type=text
                    id=competition-name
                    v-model="form.name"
                    placeholder="Enter competition name"
                    :state="state(nameFeedback)"
                />
                <b-form-invalid-feedback>{{nameFeedback}}</b-form-invalid-feedback>
            </b-form-group>

            <b-form-group :state="state(categoryFeedback)" :invalid-feedback="categoryFeedback">
                <label>Participant categories</label>
                <span>The lowest category takes priority when deciding the category of a team.</span>
                <div class=list-item v-for="category in form.categories" :key="category">
                    <span class=item-name>{{category}}</span>
                    <div class="icon btn" @click="categoryDown(category)">
                        <font-awesome-icon icon=chevron-down />
                    </div>
                    <div class="icon btn danger" @click="removeCategory(category)">
                        <font-awesome-icon icon=times />
                    </div>
                </div>
                <div class=add-list-item>
                    <b-form-input
                        type=text
                        v-model="form.newCategory"
                        placeholder="Enter new category"
                        :state="state(newCategoryFeedback)"
                    />
                    <b-button type=button variant=primary :disabled="!valid(newCategory, newCategoryFeedback)" @click="addCategory()">
                        <font-awesome-icon icon=plus />
                    </b-button>
                    <b-form-invalid-feedback>{{newCategoryFeedback}}</b-form-invalid-feedback>
                </div>
            </b-form-group>

            <b-form-group>
                <label>Challenge tags</label>
                <div class=list-item v-for="tag in form.tags" :key="tag.name">
                    <span class=item-name>{{tag.name}}</span>
                    <div class="icon btn danger" @click="removeTag(tag.name)">
                        <font-awesome-icon icon=times />
                    </div>
                    <span class=item-description>{{tag.description}}</span>
                </div>
                <div class=add-list-item>
                    <b-form-input
                        type=text
                        v-model="form.newTag.name"
                        placeholder="Enter new tag name"
                        :state="state(newTagFeedback)"
                    />
                    <b-button type=button variant=primary :disabled="!valid(newTag.name, newTagFeedback)" @click="addTag()">
                        <font-awesome-icon icon=plus />
                    </b-button>
                    <b-form-textarea
                        v-model="form.newTag.description"
                        placeholder="Enter new tag description"
                        :state="state(newTagFeedback)"
                    />
                    <b-form-invalid-feedback>{{newTagFeedback}}</b-form-invalid-feedback>
                </div>
            </b-form-group>

            <b-button type=button variant=danger @click="onCancel()">Cancel</b-button>
            <b-button type=submit variant=primary :disabled="!validForm()">Save</b-button>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

export default Vue.extend({
    name: 'AdminPanel', // TODO: add sponsors, pages, ...
    created() {
        this.loadFormData();
    },
    data: () => ({
        form: {
            name: '',
            newCategory: '',
            categories: [] as string[],
            newTag: { name: '', description: '' },
            tags: [] as { name: string, description: string }[]
        }
    }),
    computed: {
        name(): string { return this.form.name.trim(); },
        nameFeedback(): string { return this.feedback(this.name, 'Competition name', true, 3, 32, []); },
        categoryFeedback(): string { return this.form.categories.length ? '' : 'At least one category is required' },
        newCategory(): string { return this.form.newCategory.trim() },
        newCategoryFeedback(): string { return this.feedback(this.newCategory, 'Category', false, 3, 32, this.form.categories); },
        newTag() { return { name: this.form.newTag.name.trim(), description: this.form.newTag.description }; },
        newTagFeedback(): string { return this.feedback(this.newTag.name, 'Tag name', false, 3, 32, this.form.tags.map(x => x.name)); }
    },
    methods: {
        loadFormData(): void {
            this.form.newCategory = '';
            this.form.newTag = { name: '', description: '' };
            axios.get('/api/competition/data').then(response => {
                let data = response.data;
                this.form.name = data.name;
                this.form.categories = data.categories;
                this.form.tags = data.tags;
                console.log(data);
            });
        },
        onCancel(): void {
            this.loadFormData();
        },
        onSubmit(e: Event): void {
            e.preventDefault();
            axios.put('/api/competition/save', {
                name: this.name,
                categories: this.form.categories.map((category, i) => ({ name: category, priority: i })),
                tags: this.form.tags
            }).then(() => { /* TODO: show saved message */ });
        },

        feedback(input: string, name: string, required: boolean, min: number, max: number, others: string[]): string {
            let l = input.length;
            if (required && l == 0) return `${name} is required`;
            if (others.includes(input)) return `${name} already exists`;
            if (l && l < min) return `${name} must be at least ${min} characters`;
            else if (l > max) return `${name} must be at most ${max} characters`;
            return '';
        },
        state(feedback: string): boolean {
            return feedback.length == 0;
        },
        valid(input: string, feedback: string): boolean {
            return input.length > 0 && this.state(feedback);
        },
        validForm(): boolean {
            return this.state(this.nameFeedback) && this.state(this.categoryFeedback);
        },

        categoryDown(category: string): void {
            let i = this.form.categories.indexOf(category);
            if (i >= this.form.categories.length - 1) return;
            let temp = this.form.categories[i];
            Vue.set(this.form.categories, i, this.form.categories[i + 1]);
            Vue.set(this.form.categories, i + 1, temp);
        },
        removeCategory(category: string): void {
            this.form.categories = this.form.categories.filter(x => x != category);
        },
        addCategory(): void {
            if (!this.valid(this.newCategory, this.newCategoryFeedback)) return;
            this.form.categories.push(this.newCategory);
            this.form.newCategory = '';
        },

        removeTag(name: string): void {
            this.form.tags = this.form.tags.filter(x => x.name != name);
        },
        addTag(): void {
            if (!this.valid(this.newTag.name, this.newTagFeedback)) return;
            this.form.tags.push(this.newTag);
            this.form.newTag = { name: '', description: '' };
        }
    }
});
</script>

<style scoped lang="scss">
.admin-panel {
    display: flex;
    justify-content: center;
    overflow-y: scroll !important;
    padding: var(--double-margin);
    padding-bottom: 0;
}

form {
    width: min(100%, 750px);
}

form label {
    display: block;
    font-weight: bold;
    margin-bottom: 0;
}

form label ~ input, form label ~ .list-item, form label ~ .add-list-item {
    margin-top: var(--margin);
}

.list-item {
    padding: var(--margin);
    border-radius: var(--border-radius);
    background-color: var(--gray-light);
    display: flex;
    flex-wrap: wrap;
}

.list-item .item-name {
    max-width: 100%;
    word-wrap: break-word;
    margin-right: var(--margin);
    font-weight: bold;
    flex-grow: 1;
}

.list-item .icon {
    width: 1.5rem;
    height: 1.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius);
}

.list-item .item-description {
    width: 100%;
    white-space: pre-wrap;
}

.list-item .icon:hover {
    background-color: var(--primary);
    color: var(--white);
}

.list-item .icon.danger:hover {
    background-color: var(--danger);
}

.add-list-item {
    display: flex;
    flex-wrap: wrap;
}

.add-list-item input {
    width: 0;
    flex-grow: 1;
    margin-right: var(--margin);
}

.add-list-item textarea {
    width: 100%;
    margin-top: var(--margin);
}

form > button {
    width: calc(50% - var(--margin) / 2);
    margin-bottom: var(--double-margin);
}

form > .btn-danger {
    margin-right: var(--margin);
}
</style>
