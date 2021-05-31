<template>
    <div class=list-form>
        <b-form @submit="onSubmit($event)">
            <b-form-group>
                <label for=competition-name>Competition name</label>
                <b-form-input type=text trim id=competition-name v-model="form.name" placeholder="Enter competition name" :state="state(nameFeedback)"/>
                <b-form-invalid-feedback>{{nameFeedback}}</b-form-invalid-feedback>
            </b-form-group>

            <b-form-group :state="state(categoriesFeedback)" :invalid-feedback="categoriesFeedback">
                <Collapse label="Participant categories">
                    <span>The lowest category takes priority when deciding the category of a team.</span>
                    <div class=list-item v-for="category in form.categories" :key="category.order">
                        <div :class="['item-content', { editable: category.editable }]">
                            <span v-if="!category.editable" class=item-name>{{category.name}}</span>
                            <b-form-input v-else type=text trim v-model="category.name" placeholder="Enter category name" :state="state(categoryFeedback(category))"/>
                            <b-form-invalid-feedback>{{categoryFeedback(category)}}</b-form-invalid-feedback>
                        </div>
                        <IconButton class=info icon=pen icon2=save :toggled="category.editable" @click="editCategory(category)"
                            :disabled="category.editable && !state(categoryFeedback(category))"/>
                        <IconButton class=primary icon=chevron-down @click="categoryDown(category)"/>
                        <IconButton class=danger icon=times @click="removeCategory(category)"/>
                    </div>
                    <div class=add-list-item>
                        <b-form-input type=text trim v-model="add.category" placeholder="Enter new category" :state="state(newCategoryFeedback)"/>
                        <b-button type=button variant=primary :disabled="!validNewCategory" @click="addCategory()"><font-awesome-icon icon=plus /></b-button>
                        <b-form-invalid-feedback>{{newCategoryFeedback}}</b-form-invalid-feedback>
                    </div>
                </Collapse>
            </b-form-group>

            <b-form-group :state="state(tagsFeedback)" :invalid-feedback="tagsFeedback">
                <Collapse label="Challenge tags">
                    <div class=list-item v-for="tag in form.tags" :key="tag.order">
                        <div :class="['item-content', { editable: tag.editable }]">
                            <template v-if="!tag.editable">
                                <span class=item-name>{{tag.name}}</span>
                                <span class=item-description>{{tag.description}}</span>
                            </template>
                            <template v-else>
                                <b-form-input type=text trim v-model="tag.name" placeholder="Enter tag name" :state="state(tagFeedback(tag))"/>
                                <b-form-textarea max-rows="10" v-model="tag.description" placeholder="Enter tag description" :state="state(tagFeedback(tag))"/>
                                <b-form-invalid-feedback>{{tagFeedback(tag)}}</b-form-invalid-feedback>
                            </template>
                        </div>
                        <IconButton class=info icon=pen icon2=save :toggled="tag.editable" :disabled="tag.editable && !state(tagFeedback(tag))" @click="editTag(tag)"/>
                        <IconButton class=primary icon=chevron-down @click="tagDown(tag)"/>
                        <IconButton class=danger icon=times @click="removeTag(tag)"/>
                    </div>
                    <div class=add-list-item>
                        <b-form-input type=text trim v-model="add.tag.name" placeholder="Enter new tag name" :state="state(newTagFeedback)"/>
                        <b-button type=button variant=primary :disabled="!validNewTag" @click="addTag()"><font-awesome-icon icon=plus /></b-button>
                        <b-form-textarea max-rows="10" v-model="add.tag.description" placeholder="Enter new tag description" :state="state(newTagFeedback)"/>
                        <b-form-invalid-feedback>{{newTagFeedback}}</b-form-invalid-feedback>
                    </div>
                </Collapse>
            </b-form-group>

            <b-form-group :state="state(pagesFeedback)" :invalid-feedback="pagesFeedback">
                <Collapse label="Available pages">
                    <span>Pages are ordered as shown below.</span>
                    <div class=list-item v-for="page in form.pages" :key="page.order">
                        <div :class="['item-content', { editable: page.editable }]">
                            <span v-if="!page.editable" class=item-name>{{page.name}}</span>
                            <b-form-input v-else type=text trim v-model="page.name" placeholder="Enter page name" :state="state(pageFeedback(page))"/>
                            <span class=item-description>
                                <span class=item-category>Path</span>
                                <span v-if="!page.editable" class=item-value>{{page.path}}</span>
                                <b-form-input v-else type=text trim v-model="page.path" placeholder="Enter page path" :state="state(pageFeedback(page))"/>
                            </span>
                            <span class=item-description>
                                <span class=item-category>Source</span>
                                <span v-if="!page.editable" class=item-value>{{source(page)}}</span>
                                <template v-else> <!-- TODO: half -->
                                    <b-form-file class=half accept=".html" v-model="page.html" :placeholder="htmlPlaceholder(page)" :state="state(pageFeedback(page))"/>
                                    <b-form-file class=half accept=".zip" v-model="page.zip" :placeholder="zipPlaceholder(page)" :state="state(pageFeedback(page))"/>
                                </template>
                            </span>
                            <span v-if="page.html && page.source && !page.zip" class=info>You are uploading a new page, any old depencies will be removed</span>
                            <b-form-invalid-feedback class=info>{{pageFeedback(page)}}</b-form-invalid-feedback>
                        </div>
                        <IconButton class=info icon=pen icon2=save :toggled="page.editable" :disabled="page.editable && !state(pageFeedback(page))" @click="editPage(page)"/>
                        <IconButton class=primary icon=chevron-down @click="pageDown(page)"/>
                        <IconButton class=danger icon=times @click="removePage(page)"/>
                    </div>
                    <div class=add-list-item>
                        <b-form-input type=text trim v-model="add.page.name" placeholder="Enter new page name" :state="state(newPageFeedback)"/>
                        <b-button type=button variant=primary :disabled="!validNewPage" @click="addPage()"><font-awesome-icon icon=plus /></b-button>
                        <b-form-input type=text trim v-model="add.page.path" placeholder="Enter new page path" :state="state(newPageFeedback)"/>
                        <b-form-file class=half accept=".html" v-model="add.page.html" :placeholder="htmlPlaceholder()" :state="state(newPageFeedback)"/>
                        <b-form-file class=half accept=".zip" v-model="add.page.zip" :placeholder="zipPlaceholder()" :state="state(newPageFeedback)"/>
                        <b-form-invalid-feedback class=info>{{newPageFeedback}}</b-form-invalid-feedback>
                        <span class=info>Page dependencies are unzipped inside the same folder as the page HTML</span>
                    </div>
                </Collapse>
            </b-form-group>

            <b-form-group :state="state(sponsorsFeedback)" :invalid-feedback="sponsorsFeedback">
                <Collapse label="Competition sponsors">
                    <div class=list-item v-for="sponsor in form.sponsors" :key="sponsor.order">
                        <div :class="['item-content', { editable: sponsor.editable }]">
                            <span v-if="!sponsor.editable" class=item-name>{{sponsor.name}}</span>
                            <b-form-input v-else type=text trim v-model="sponsor.name" placeholder="Enter sponsor name" :state="state(sponsorFeedback(sponsor))"/>
                            <span class=item-description>
                                <span class=item-category>Link</span>
                                <span v-if="!sponsor.editable" class=item-value>{{sponsor.link}}</span>
                                <b-form-input v-else type=text trim v-model="sponsor.link" placeholder="Enter sponsor link" :state="state(sponsorFeedback(sponsor))"/>
                            </span>
                            <span class=item-description>
                                <span class=item-category>Icon</span>
                                <span v-if="!sponsor.editable" class=item-value>{{icon(sponsor)}}</span>
                                <b-form-file v-else accept=".jpg, .jpeg, .png" v-model="sponsor.img" :placeholder="imgPlaceholder(sponsor)" :state="state(sponsorFeedback(sponsor))"/>
                                <b-form-invalid-feedback>{{sponsorFeedback(sponsor)}}</b-form-invalid-feedback>
                            </span>
                        </div>
                        <IconButton class=info icon=pen icon2=save :toggled="sponsor.editable" @click="editSponsor(sponsor)"
                            :disabled="sponsor.editable && !state(sponsorFeedback(sponsor))"/>
                        <IconButton class=primary icon=chevron-down @click="sponsorDown(sponsor)"/>
                        <IconButton class=danger icon=times @click="removeSponsor(sponsor)"/>
                    </div>
                    <div class=add-list-item>
                        <b-form-input type=text trim v-model="add.sponsor.name" placeholder="Enter new sponsor name" :state="state(newSponsorFeedback)"/>
                        <b-button type=button variant=primary :disabled="!validNewSponsor" @click="addSponsor()"><font-awesome-icon icon=plus /></b-button>
                        <b-form-input type=text trim v-model="add.sponsor.link" placeholder="Enter new sponsor link" :state="state(newSponsorFeedback)"/>
                        <b-form-file accept=".jpg, .jpeg, .png" v-model="add.sponsor.img" placeholder="Upload sponsor icon" :state="state(newSponsorFeedback)"/>
                        <b-form-invalid-feedback>{{newSponsorFeedback}}</b-form-invalid-feedback>
                    </div>
                </Collapse>
            </b-form-group>

            <StatusButton type=button variant=danger :state="cancelState" normal=Cancel loading=Loading succes=Loaded :disabled="saveState == 'loading'" @click="onCancel()"/>
            <StatusButton type=submit variant=primary :state="saveState" normal=Save loading=Saving succes=Saved :disabled="!validForm || cancelState == 'loading'"/>
            <span>{{savedMessage}}</span>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Collapse from '@/components/Collapse.vue';
import IconButton from '@/components/IconButton.vue';
import StatusButton from '@/components/StatusButton.vue';
import { nextOrder, moveDown } from '@/assets/functions/list';
import { state, validInput, validForm, validate, Category, Tag, Page, Sponsor, Form, isf } from '@shared/validation/configForm';
import { serialize } from '@shared/objectFormdata';
import path from 'path';

type Editable = { editable?: boolean };

export default Vue.extend({
    name: 'Config',
    components: {
        Collapse,
        IconButton,
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
            sponsors: []
        } as Form,
        add: {
            category: '',
            tag: { name: '', description: '' },
            page: { name: '', path: '', html: null as File | null, zip: null as File | null },
            sponsor: { name: '', link: '', img: null as File | null }
        },
        loaded: false,
        saveState: 'normal',
        cancelState: 'normal',
        savedMessage: ''
    }),
    computed: {
        nameFeedback(): string { return validate.name(this.form.name); },

        newCategory(): Category { return { name: this.add.category, order: nextOrder(this.form.categories) }; },
        newTag(): Tag { return Object.assign({}, this.add.tag, { order: nextOrder(this.form.tags) }); },
        newPage(): Page { return Object.assign({}, this.add.page, { source: '', order: nextOrder(this.form.pages) } ); },
        newSponsor(): Sponsor { return Object.assign({}, this.add.sponsor, { icon: '', order: nextOrder(this.form.sponsors) } ); },

        newCategoryFeedback(): string { return this.categoryFeedback(this.newCategory, true); },
        validNewCategory(): boolean { return validInput(this.newCategoryFeedback, this.newCategory.name); },
        newTagFeedback(): string { return this.tagFeedback(this.newTag, true); },
        validNewTag(): boolean { return validInput(this.newTagFeedback, this.newTag.name); },
        newPageFeedback(): string { return this.pageFeedback(this.newPage, true); },
        validNewPage(): boolean { return validInput(this.newPageFeedback, this.newPage.name, this.newPage.path) && this.newPage.html != null; },
        newSponsorFeedback(): string { return this.sponsorFeedback(this.newSponsor, true); },
        validNewSponsor(): boolean { return validInput(this.newSponsorFeedback, this.newSponsor.name, this.newSponsor.link) && this.newSponsor.img != null; },

        categoriesFeedback(): string { return validate.categories(this.form.categories); },
        tagsFeedback(): string { return validate.tags(this.form.tags); },
        pagesFeedback(): string { return validate.pages(this.form.pages); },
        sponsorsFeedback(): string { return validate.sponsors(this.form.sponsors); },

        validForm(): boolean { return validForm(this.form); }
    },
    watch: {
        form: { deep: true, handler() {
            let state = 'normal';
            if (this.loaded) {
                state = 'succes';
                this.loaded = false;
            }
            else this.savedMessage = '';
            this.saveState = state;
            this.cancelState = state;
        }}
    },
    methods: {
        state, // make the state function available in the html

        loadFormData(clear: boolean = true): void {
            this.cancelState = 'loading';
            if (clear) {
                this.add.category = '';
                this.add.tag = { name: '', description: '' };
                this.add.page = { name: '', path: '', html: null, zip: null };
                this.add.sponsor = { name: '', link: '', img: null };
            }
            const error = () => {
                this.cancelState = 'error';
                this.saveState = 'normal';
            }
            axios.get('/api/competition/data').then(res => {
                let data: Form = res.data;
                if (!isf.form(data)) return error();
                this.loaded = true;
                this.form = data;
            }).catch(() => error());
        },
        onCancel(): void {
            this.loadFormData();
        },
        onSubmit(e: Event): void {
            e.preventDefault();
            this.saveState = 'loading';
            const error = () => this.saveState = 'error';
            axios.put('/api/competition/save', serialize(this.form)).then(res => {
                if (res.data.error) return error();
                this.loadFormData(false);
                this.savedMessage = 'Some changes might require a reload to take effect';
            }).catch(() => error());
        },

        categoryFeedback(category: Category, add?: boolean): string { return validate.category(category, this.form.categories, add); },
        categoryDown(category: Category): void { moveDown(this.form.categories, category.order); },
        removeCategory(category: Category): void { this.form.categories = this.form.categories.filter(x => x.order != category.order); },
        editCategory(category: Category & Editable): void { if (!category.editable || state(this.categoryFeedback(category))) Vue.set(category, 'editable', !category.editable); },
        addCategory(): void {
            if (!this.validNewCategory) return;
            this.form.categories.push(this.newCategory);
            this.add.category = '';
        },

        tagFeedback(tag: Tag, add?: boolean): string { return validate.tag(tag, this.form.tags, add); },
        tagDown(tag: Tag): void { moveDown(this.form.tags, tag.order); },
        removeTag(tag: Tag): void { this.form.tags = this.form.tags.filter(x => x.order != tag.order); },
        editTag(tag: Tag & Editable): void { if (!tag.editable || state(this.tagFeedback(tag))) Vue.set(tag, 'editable', !tag.editable); },
        addTag(): void {
            if (!this.validNewTag) return;
            this.form.tags.push(this.newTag);
            this.add.tag = { name: '', description: '' };
        },

        source(page: Page): string { return page.html ? page.html.name || '' : path.basename(page.source); },
        htmlPlaceholder(page: Page): string { return page && (page.html || page.source) ? this.source(page) : 'Upload page HTML'; },
        zipPlaceholder(page?: Page): string { return page?.zip ? page.zip.name || '' : (page?.source ? 'New page dependencies' : 'Upload page dependencies') },
        pageFeedback(page: Page, add?: boolean): string { return validate.page(page, this.form.pages, add); },
        pageDown(page: Page): void { moveDown(this.form.pages, page.order); },
        removePage(page: Page): void { this.form.pages = this.form.pages.filter(x => x.order != page.order); },
        editPage(page: Page & Editable): void { if (!page.editable || state(this.pageFeedback(page))) Vue.set(page, 'editable', !page.editable); },
        addPage(): void {
            if (!this.validNewPage) return;
            this.form.pages.push(this.newPage);
            this.add.page = { name: '', path: '', html: null, zip: null };
        },

        icon(sponsor: Sponsor): string { return sponsor.img ? sponsor.img.name || '' : path.basename(sponsor.icon); },
        imgPlaceholder(sponsor?: Sponsor): string { return sponsor && (sponsor.img || sponsor.icon) ? this.icon(sponsor) : 'Upload sponsor icon'; },
        sponsorFeedback(sponsor: Sponsor, add?: boolean): string { return validate.sponsor(sponsor, this.form.sponsors, add); },
        sponsorDown(sponsor: Sponsor): void { moveDown(this.form.sponsors, sponsor.order); },
        removeSponsor(sponsor: Sponsor): void { this.form.sponsors = this.form.sponsors.filter(x => x.order != sponsor.order); },
        editSponsor(sponsor: Sponsor & Editable): void { if (!sponsor.editable || state(this.sponsorFeedback(sponsor))) Vue.set(sponsor, 'editable', !sponsor.editable); },
        addSponsor(): void {
            if (!this.validNewSponsor) return;
            this.form.sponsors.push(this.newSponsor);
            this.add.sponsor = { name: '', link: '', img: null };
        },
    }
});
</script>

<style scoped lang="scss">
@import '@/assets/css/listform.scss';

form label {
    font-weight: bold;
    margin-bottom: 0;
}

span.info {
    width: 100%;
    font-size: var(--font-small);
    margin-top: var(--half-margin);
}

.list-item {
    .item-category ~ span:not(.item-value), .item-category ~ .invalid-feedback {
        width: 100%;
    }
    
    .b-form-file.half:first-of-type {
        margin-right: var(--margin);
    }

}

.add-list-item {
    .b-form-file.half {
        width: 0;
        flex-grow: 1;
        margin-top: var(--margin);
    }

    .b-form-file.half:first-of-type {
        margin-right: var(--margin);
    }
}

$breakpoint-sm: 576px;
@media (max-width: $breakpoint-sm) {
    .list-item {
        .b-form-file.half:first-of-type {
            margin-right: 0;
        }

        .b-form-file.half:not(:first-of-type) {
            margin-top: var(--half-margin);
        }
    }

    .add-list-item {
        .b-form-file.half {
            width: 100%;
        }

        .b-form-file.half:first-of-type {
            margin-right: 0;
        }
    }
}

form > button {
    margin-bottom: 0;
}

form > :last-child {
    display: block;
    padding-bottom: var(--double-margin);
}
</style>
