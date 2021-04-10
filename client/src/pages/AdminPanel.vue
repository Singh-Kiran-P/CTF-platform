<template>
    <div class=admin-panel>
        <b-form @submit="onSubmit($event)">
            <b-form-group class=add-style>
                <label for=competition-name>Competition name</label>
                <b-form-input
                    type=text
                    id=competition-name
                    v-model="form.name"
                    placeholder="Enter competition name"
                    required
                />
            </b-form-group>

            <b-form-group>
                <label>Participant categories</label>
                <div class=list-item v-for="category in form.categories" :key="category">
                    <span class=item-name>{{category}}</span>
                    <div class="icon btn" @click="removeCategory(category)">
                        <font-awesome-icon icon=times />
                    </div>
                </div>
                <div class=add-list-item>
                    <b-form-input
                        type=text
                        v-model="form.newCategory"
                        placeholder="Enter new category"
                        :state="newCategoryState"
                    />
                    <b-button type=button variant=primary @click="addCategory()"><font-awesome-icon icon=plus /></b-button>
                    <b-form-invalid-feedback>{{newCategoryFeedback}}</b-form-invalid-feedback>
                </div>
            </b-form-group>

            <b-form-group>
                <label>Challenge tags</label>
                <div class=list-item v-for="tag in form.tags" :key="tag.name">
                    <span class=item-name>{{tag.name}}</span>
                    <div class="icon btn" @click="removeTag(tag.name)">
                        <font-awesome-icon icon=times />
                    </div>
                    <span class=item-description>{{tag.description}}</span>
                </div>
                <div class=add-list-item>
                    <b-form-input
                        type=text
                        v-model="form.newTag.name"
                        placeholder="Enter new tag name"
                        :state="newTagState"
                    />
                    <b-button type=button variant=primary @click="addTag()"><font-awesome-icon icon=plus /></b-button>
                    <b-form-textarea
                        v-model="form.newTag.description"
                        placeholder="Enter new tag description"
                        :state="newTagState"
                    />
                    <b-form-invalid-feedback>{{newTagFeedback}}</b-form-invalid-feedback>
                </div>
            </b-form-group>

            <b-button type=button variant=danger @click="onCancel()">Cancel</b-button>
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
            name: '',
            categories: [] as string[],
            tags: [] as { name: string, description: string }[],
            newCategory: '',
            newTag: { name: '', description: '' }
        }
    }),
    methods: {
        loadFormData(): void {
            // TODO: load from database
            this.form.name = 'Epic cool competition';
            this.form.categories = ['BACH 1', 'BACH 2'];
            this.form.tags = [{ name: 'crypto', description: 'Cryptography challenges for who is the is crypto with challenge that have crypto have the challenge is for crypto is?' }, { name: 'newtworking', description: 'fre rtg gtr yhtkn y fyu tf uhhjbkn hkj bhj hjkbk jhb ytf yuf tr dtry dtrdydytrdtyr  yu hb uyhohyuyuhohyu t yf tf yut fuytfuyttuyf uytf ytu uyt f ytf yut fy ty uyftuytfyutftyutf f uyt f tyuf tfffff' }]
            this.form.newCategory = '';
            this.form.newTag = { name: '', description: '' };
        },
        onSubmit(e: Event): void {
            e.preventDefault();
            // TODO: store in database
        },
        onCancel(): void {
            this.loadFormData();
        },

        removeCategory(category: string) {
            this.form.categories = this.form.categories.filter(x => x != category);
        },
        addCategory() {
            if (!this.newCategoryState || !this.newCategory) return;
            this.form.categories.push(this.newCategory);
            this.form.newCategory = '';
        },
        removeTag(name: string) {
            this.form.tags = this.form.tags.filter(x => x.name != name);
        },
        addTag() {
            if (!this.newTagState || !this.newTag.name) return;
            this.form.tags.push(this.newTag);
            this.form.newTag = { name: '', description: '' };
        }
    },
    computed: {
        newCategory(): string {
            return this.form.newCategory.trim()
        },
        newCategoryFeedback(): string {
            if (this.form.categories.includes(this.newCategory)) return 'Category already exists';
            let length = this.newCategory.length;
            if (length && length < 3) return 'Category must be at least 3 characters';
            if (length > 32) return 'Category must be at most 32 characters';
            return '';
        },
        newCategoryState(): boolean {
            return this.newCategoryFeedback.length == 0;
        },
        newTag(): { name: string, description: string } {
            return { name: this.form.newTag.name.trim(), description: this.form.newTag.description };
        },
        newTagFeedback(): string {
            if (this.form.tags.filter(x => x.name == this.newTag.name).length > 0) return 'Tag name already exists';
            let length = this.newTag.name.length;
            if (length && length < 3) return 'Tag name must be at least 3 characters';
            if (length > 32) return 'Tag name must be at most 32 characters';
            return '';
        },
        newTagState(): boolean {
            return this.newTagFeedback.length == 0;
        }
    }
});
</script>

<style scoped lang="scss">
.admin-panel {
    padding: var(--double-margin);
    display: flex;
    justify-content: center;
}

form {
    width: min(100%, 750px);
}

form label {
    display: block;
    font-weight: bold;
    margin-bottom: var(--margin);
}

.list-item {
    padding: var(--margin);
    margin-bottom: var(--margin);
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
    background-color: var(--danger);
    color: var(--white);
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
}

form > .btn-danger {
    margin-right: var(--margin);
}
</style>
