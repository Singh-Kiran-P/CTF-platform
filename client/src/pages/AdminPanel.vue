<template>
    <div class=admin-panel>
        <b-form @submit="onSubmit($event)">
            <b-form-group>
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

            <b-form-group :state="state(categoriesFeedback)" :invalid-feedback="categoriesFeedback">
                <Collapse label="Participant categories">
                    <span>The lowest category takes priority when deciding the category of a team.</span>
                    <div class=list-item v-for="category in categories" :key="category.name">
                        <span class=item-name>{{category.name}}</span>
                        <div class=item-options>
                            <button class="icon primary" @click="categoryDown(category)">
                                <font-awesome-icon icon=chevron-down />
                            </button>
                            <button class="icon danger" @click="removeCategory(category)">
                                <font-awesome-icon icon=times />
                            </button>
                        </div>
                    </div>
                    <div class=add-list-item>
                        <b-form-input
                            type=text
                            v-model="form.category"
                            placeholder="Enter new category"
                            :state="state(newCategoryFeedback)"
                        />
                        <b-button type=button variant=primary :disabled="!validNewCategory" @click="addCategory()">
                            <font-awesome-icon icon=plus />
                        </b-button>
                        <b-form-invalid-feedback>{{newCategoryFeedback}}</b-form-invalid-feedback>
                    </div>
                </Collapse>
            </b-form-group>

            <b-form-group :state="state(tagsFeedback)" :invalid-feedback="tagsFeedback">
                <Collapse label="Challenge tags">
                    <div class=list-item v-for="tag in tags" :key="tag.name">
                        <span class=item-name>{{tag.name}}</span>
                        <div class=item-options>
                            <button class="icon danger" @click="removeTag(tag)">
                                <font-awesome-icon icon=times />
                            </button>
                        </div>
                        <span class=item-description>{{tag.description}}</span>
                    </div>
                    <div class=add-list-item>
                        <b-form-input
                            type=text
                            v-model="form.tag.name"
                            placeholder="Enter new tag name"
                            :state="state(newTagFeedback)"
                        />
                        <b-button type=button variant=primary :disabled="!validNewTag" @click="addTag()">
                            <font-awesome-icon icon=plus />
                        </b-button>
                        <b-form-textarea
                            v-model="form.tag.description"
                            placeholder="Enter new tag description"
                            :state="state(newTagFeedback)"
                        />
                        <b-form-invalid-feedback>{{newTagFeedback}}</b-form-invalid-feedback>
                    </div>
                </Collapse>
            </b-form-group>

            <b-form-group :state="state(pagesFeedback)" :invalid-feedback="pagesFeedback">
                <Collapse label="Available pages">
                    <span>Pages are ordered as shown below.</span>
                    <div class=list-item v-for="page in pages" :key="page.path">
                        <span class=item-name>{{page.name}}</span>
                        <div class=item-options>
                            <button class="icon primary" @click="pageDown(page)">
                                <font-awesome-icon icon=chevron-down />
                            </button>
                        </div>
                        <span class=item-description><span class=item-category>Path</span>{{page.path}}</span>
                        <span class=item-description><span class=item-category>Source</span>{{page.source}}</span>
                    </div>
                    <div class=add-list-item>
                        <b-form-input
                            type=text
                            v-model="form.page.name"
                            placeholder="Enter new page name"
                            :state="state(newPageFeedback)"
                        />
                        <b-button type=button variant=primary :disabled="!validNewPage" @click="addPage()">
                            <font-awesome-icon icon=plus />
                        </b-button>
                        <b-form-input
                            type=text
                            v-model="form.page.path"
                            placeholder="Enter new page path"
                            :state="state(newPageFeedback)"
                        />
                        <b-form-file
                            accept=".html"
                            v-model="form.page.html"
                            placeholder="Upload HTML..."
                            drop-placeholder="Drop HTML..."
                            :state="state(newPageFeedback)"
                        />
                        <b-form-file
                            multiple
                            v-model="form.page.attachments"
                            placeholder="Upload attachments..."
                            drop-placeholder="Drop attachments..."
                            :state="state(newPageFeedback)"
                        />
                        <b-form-invalid-feedback>{{newPageFeedback}}</b-form-invalid-feedback>
                    </div>
                </Collapse>
            </b-form-group>

            <b-form-group>
                <Collapse label="Competition sponsors">
                    <span>TODO: sponsors</span>
                </Collapse>
            </b-form-group>

            <b-button type=button variant=danger @click="onCancel()">Cancel</b-button>
            <b-button type=submit variant=primary :disabled="!validForm()">Save</b-button>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Collapse from '@/components/Collapse.vue';
import { state, validInput, validForm, validate, Category, Tag, Page } from '@shared/validateCompetitionForm';

export default Vue.extend({
    name: 'AdminPanel',
    components: {
        Collapse  
    },
    created() {
        this.loadFormData();
    },
    data: () => ({
        categories: [] as Category[],
        tags: [] as Tag[],
        pages: [] as Page[],
        form: {
            name: '',
            category: '',
            tag: { name: '', description: '' },
            page: { name: '', path: '', html: null as File | null, attachments: [] as File[] },
        }
    }),
    computed: {
        name(): string { return this.form.name.trim(); },
        nameFeedback(): string { return validate.name(this.name); },
        newCategory(): Category { return { name: this.form.category.trim(), priority: this.categories.reduce((x, y) => Math.max(x, y.priority), 0) + 1 }; },
        newCategoryFeedback(): string { return validate.category(this.newCategory, this.categories); },
        validNewCategory(): boolean { return validInput(this.newCategoryFeedback, this.newCategory.name); },
        newTag(): Tag { return Object.assign({}, this.form.tag, { name: this.form.tag.name.trim() }); },
        newTagFeedback(): string { return validate.tag(this.newTag, this.tags); },
        validNewTag(): boolean { return validInput(this.newTagFeedback, this.newTag.name); },
        newPage(): Page { return Object.assign({}, this.form.page, { name: this.form.page.name.trim(), path: this.form.page.path.trim(), source: this.form.page.html?.name || '' }); },
        newPageFeedback(): string { return validate.page(this.newPage, this.pages); },
        validNewPage(): boolean { return validInput(this.newPageFeedback, this.newPage.name, this.newPage.path) && this.newPage.html != null; },
        categoriesFeedback(): string { return validate.categories(this.categories); },
        tagsFeedback(): string { return validate.tags(this.tags); },
        pagesFeedback(): string { return validate.pages(this.pages); }
    },
    methods: {
        state,
        validForm() {
            return validForm({ name: this.name, categories: this.categories, tags: this.tags, pages: this.pages }, false)
        },

        loadFormData(): void {
            this.form.category = '';
            this.form.tag = { name: '', description: '' };
            this.form.page = { name: '', path: '', html: null, attachments: [] };
            axios.get('/api/competition/data').then(response => {
                let data = response.data;
                if (!validForm(data)) return alert('error'); // TODO: replace this
                this.form.name = data.name;
                this.categories = data.categories;
                this.tags = data.tags;
                this.pages = data.pages;
            });
        },
        onCancel(): void {
            console.log()
            this.loadFormData();
        },
        onSubmit(e: Event): void {
            e.preventDefault();
            axios.put('/api/competition/save', {
                name: this.name,
                categories: this.categories,
                tags: this.tags,
                pages: this.pages
            }).then(response => {
                if (response.data.error) // TODO: replace this
                    alert('error');
            });
        },

        moveDown<T>(list: T[], predicate: (x: T) => boolean, set: (x: T, y: T) => T): void {
            let i = list.findIndex(x => predicate(x));
            if (i < 0 || i >= list.length - 1) return;
            let temp = list[i];
            Vue.set(list, i, set(list[i], list[i + 1]));
            Vue.set(list, i + 1, set(list[i + 1], temp));
        },

        categoryDown(category: Category): void {
            this.moveDown(this.categories, x => x.name == category.name, (x, y) => Object.assign({}, x, { name: y.name }));
        },
        removeCategory(category: Category): void {
            this.categories = this.categories.filter(x => x.name != category.name);
        },
        addCategory(): void {
            if (!this.validNewCategory) return;
            this.categories.push(this.newCategory);
            this.form.category = '';
        },

        removeTag(tag: Tag): void {
            this.tags = this.tags.filter(x => x.name != tag.name);
        },
        addTag(): void {
            if (!this.validNewTag) return;
            this.tags.push(this.newTag);
            this.form.tag = { name: '', description: '' };
        },

        pageDown(page: Page): void {
            this.moveDown(this.pages, x => x.path == page.path, (_, y) => y);
        },
        removePage(page: Page): void {
            this.pages = this.pages.filter(x => x.path != page.path);
        },
        addPage(): void {
            if (!this.validNewPage) return;
            this.pages.push(this.newPage);
            this.form.page = { name: '', path: '', html: null, attachments: [] };
        }
    }
});
</script>

<style scoped lang="scss">
@import '@/assets/css/iconButton.scss';

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
    font-weight: bold;
    margin-bottom: 0;
}

.list-item, .add-list-item {
    margin-top: var(--margin);
}

.list-item {
    padding: var(--margin);
    border-radius: var(--border-radius);
    background-color: var(--gray-light);
}

.list-item span {
    max-width: 100%;
    display: inline-block;
    word-wrap: break-word;
}

.list-item .item-options {
    float: right;
}

.list-item .item-name {
    display: initial;
    margin-right: var(--margin);
    font-weight: bold;
}

.list-item .item-description {
    width: 100%;
    white-space: pre-wrap;
}

.list-item .item-category {
    min-width: 5rem;
    color: var(--gray);
}

.add-list-item {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: var(--double-margin);
}

.add-list-item input, .add-list-item textarea, .add-list-item .b-form-file {
    width: 100%;
    margin-top: var(--margin);
}

.add-list-item input:first-of-type {
    width: 0;
    flex-grow: 1;
    margin-top: 0;
    margin-right: var(--margin);
}

form > button {
    width: calc(50% - var(--margin) / 2);
    margin-bottom: var(--double-margin);
}

form > .btn-danger {
    margin-right: var(--margin);
}
</style>
