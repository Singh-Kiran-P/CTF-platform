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
                    <div class=list-item v-for="category in form.categories" :key="category.name">
                        <span class=item-name>{{category.name}}</span>
                        <div class=item-options>
                            <b-button type=button class="icon primary" @click="categoryDown(category)">
                                <font-awesome-icon icon=chevron-down />
                            </b-button>
                            <b-button type=button class="icon danger" @click="removeCategory(category)">
                                <font-awesome-icon icon=times />
                            </b-button>
                        </div>
                    </div>
                    <div class=add-list-item>
                        <b-form-input
                            type=text
                            v-model="add.category"
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
                    <div class=list-item v-for="tag in form.tags" :key="tag.name">
                        <span class=item-name>{{tag.name}}</span>
                        <div class=item-options>
                            <b-button type=button class="icon danger" @click="removeTag(tag)">
                                <font-awesome-icon icon=times />
                            </b-button>
                        </div>
                        <span class=item-description>{{tag.description}}</span>
                    </div>
                    <div class=add-list-item>
                        <b-form-input
                            type=text
                            v-model="add.tag.name"
                            placeholder="Enter new tag name"
                            :state="state(newTagFeedback)"
                        />
                        <b-button type=button variant=primary :disabled="!validNewTag" @click="addTag()">
                            <font-awesome-icon icon=plus />
                        </b-button>
                        <b-form-textarea
                            v-model="add.tag.description"
                            placeholder="Enter new tag description"
                            :state="state(newTagFeedback)"
                        />
                        <b-form-invalid-feedback>{{newTagFeedback}}</b-form-invalid-feedback>
                    </div>
                </Collapse>
            </b-form-group>

            <b-form-group :state="state(pagesFeedback)" :invalid-feedback="pagesFeedback">
                <Collapse label="Available pages">
                    <span>Pages are ordered as shown below.</span> <!-- TODO: make this work (same way as categories) -->
                    <div class=list-item v-for="page in form.pages" :key="page.path">
                        <span class=item-name>{{page.name}}</span>
                        <div class=item-options>
                            <b-button type=button class="icon primary" @click="pageDown(page)">
                                <font-awesome-icon icon=chevron-down />
                            </b-button>
                            <b-button type=button class="icon danger" @click="removePage(page)">
                                <font-awesome-icon icon=times />
                            </b-button>
                        </div>
                        <span class=item-description><span class=item-category>Path</span>{{page.path}}</span>
                        <span class=item-description><span class=item-category>Source</span>{{page.source}}</span>
                    </div>
                    <div class=add-list-item>
                        <b-form-input
                            type=text
                            v-model="add.page.name"
                            placeholder="Enter new page name"
                            :state="state(newPageFeedback)"
                        />
                        <b-button type=button variant=primary :disabled="!validNewPage" @click="addPage()">
                            <font-awesome-icon icon=plus />
                        </b-button>
                        <b-form-input
                            type=text
                            v-model="add.page.path"
                            placeholder="Enter new page path"
                            :state="state(newPageFeedback)"
                        />
                        <b-form-file
                            accept=".html"
                            v-model="add.page.html"
                            placeholder="Upload HTML..."
                            drop-placeholder="Drop HTML..."
                            :state="state(newPageFeedback)"
                        />
                        <b-form-file
                            accept=".zip"
                            v-model="add.page.zip"
                            placeholder="Upload attachments..."
                            drop-placeholder="Drop attachments..."
                            :state="state(newPageFeedback)"
                        />
                        TODO: attachment explanation
                        <b-form-invalid-feedback>{{newPageFeedback}}</b-form-invalid-feedback>
                    </div>
                </Collapse>
            </b-form-group>

            <b-form-group>
                <Collapse label="Competition sponsors">
                    <span>TODO: sponsors</span>
                </Collapse>
            </b-form-group>

            <StatusButton type=button variant=danger :state="cancelState" normal=Cancel loading=Loading succes=Loaded :disabled="saveState == 'loading'" @click="onCancel()"/>
            <StatusButton type=submit variant=primary :state="saveState" normal=Save loading=Saving succes=Saved :disabled="!validForm() || cancelState == 'loading'"/>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Collapse from '@/components/Collapse.vue';
import StatusButton from '@/components/StatusButton.vue';
import { state, validInput, validForm, validate, Category, Tag, Page, Form } from '@shared/validateCompetitionForm';
import { serialize } from '@shared/objectFormData';

export default Vue.extend({
    name: 'AdminPanel',
    components: {
        Collapse,
        StatusButton 
    },
    created() {
        this.loadFormData();
    },
    data: () => ({
        form: {
            name: '',
            categories: [],
            tags: [],
            pages: [],
        } as Form,
        add: {
            category: '',
            tag: { name: '', description: '' },
            page: { name: '', path: '', html: null as File | null, zip: null as File | null },
        },
        loaded: false,
        saveState: 'normal',
        cancelState: 'normal'
    }),
    computed: {
        name(): string { return this.form.name.trim(); },
        nameFeedback(): string { return validate.name(this.name); },
        newCategory(): Category { return { name: this.add.category.trim(), priority: this.form.categories.reduce((x, y) => Math.max(x, y.priority), 0) + 1 }; },
        newCategoryFeedback(): string { return validate.category(this.newCategory, this.form.categories); },
        validNewCategory(): boolean { return validInput(this.newCategoryFeedback, this.newCategory.name); },
        newTag(): Tag { return Object.assign({}, this.add.tag, { name: this.add.tag.name.trim() }); },
        newTagFeedback(): string { return validate.tag(this.newTag, this.form.tags); },
        validNewTag(): boolean { return validInput(this.newTagFeedback, this.newTag.name); },
        newPage(): Page { return Object.assign({}, this.add.page, { name: this.add.page.name.trim(), path: this.add.page.path.trim(), source: this.add.page.html?.name || '' }); },
        newPageFeedback(): string { return validate.page(this.newPage, this.form.pages); },
        validNewPage(): boolean { return validInput(this.newPageFeedback, this.newPage.name, this.newPage.path) && this.newPage.html != null; },
        categoriesFeedback(): string { return validate.categories(this.form.categories); },
        tagsFeedback(): string { return validate.tags(this.form.tags); },
        pagesFeedback(): string { return validate.pages(this.form.pages); }
    },
    watch: {
        form: { deep: true, handler() {
            let state = 'normal';
            if (this.loaded) {
                state = 'succes';
                this.loaded = false;
            }
            this.saveState = state;
            this.cancelState = state;
        }}
    },
    methods: {
        state, // make the state function available in the html
        validForm(): boolean { return validForm(this.form, false); },

        loadFormData(): void {
            this.cancelState = 'loading';
            this.add.category = '';
            this.add.tag = { name: '', description: '' };
            this.add.page = { name: '', path: '', html: null, zip: null };
            axios.get('/api/competition/data').then(res => {
                let data: Form = res.data;
                if (!validForm(data)) return this.cancelState = 'error';
                this.loaded = true;
                this.form = data;
            }).catch(() => this.cancelState = 'error');
        },
        onCancel(): void {
            this.loadFormData();
        },
        onSubmit(e: Event): void {
            e.preventDefault();
            this.saveState = 'loading';
            const error = () => this.saveState = 'error';
            axios.put('/api/competition/save', serialize(this.form)).then(res => {
                res.data.error ? error() : this.loadFormData();
            }).catch(() => error());
        },

        moveDown<T>(list: T[], predicate: (x: T) => boolean, set: (x: T, y: T) => T): void {
            let i = list.findIndex(x => predicate(x));
            if (i < 0 || i >= list.length - 1) return;
            let temp = list[i];
            Vue.set(list, i, set(list[i], list[i + 1]));
            Vue.set(list, i + 1, set(list[i + 1], temp));
        },

        categoryDown(category: Category): void {
            this.moveDown(this.form.categories, x => x.name == category.name, (x, y) => Object.assign({}, x, { name: y.name }));
        },
        removeCategory(category: Category): void {
            this.form.categories = this.form.categories.filter(x => x.name != category.name);
        },
        addCategory(): void {
            if (!this.validNewCategory) return;
            this.form.categories.push(this.newCategory);
            this.add.category = '';
        },

        removeTag(tag: Tag): void {
            this.form.tags = this.form.tags.filter(x => x.name != tag.name);
        },
        addTag(): void {
            if (!this.validNewTag) return;
            this.form.tags.push(this.newTag);
            this.add.tag = { name: '', description: '' };
        },

        pageDown(page: Page): void {
            this.moveDown(this.form.pages, x => x.path == page.path, (_, y) => y);
        },
        removePage(page: Page): void {
            this.form.pages = this.form.pages.filter(x => x.path != page.path);
        },
        addPage(): void {
            if (!this.validNewPage) return;
            this.form.pages.push(this.newPage);
            this.add.page = { name: '', path: '', html: null, zip: null };
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
