<template>
    <div>
        <div class="login">
            <div class="l-wrap">

                <h1 class="m-b-25 p-b-25">Settings</h1>

                <form>
                    <div class="input-group ig-dark">
                        <input id="accessKeyId" v-model="credentials.accessKeyId"
                               class="ig-text" type="text" spellcheck="false" required autocomplete="off">
                        <i class="ig-helpers"></i>
                        <label class="ig-label">Access Key</label>
                    </div>
                    <div class="input-group ig-dark">
                        <input id="accessKeySecret" v-model="credentials.accessKeySecret"
                               class="ig-text" type="password" spellcheck="false" required autocomplete="off">
                        <i class="ig-helpers"></i>
                        <label class="ig-label">Secret Key</label>
                    </div>
                    <div class="input-group ig-dark">
                        <input id="bucketRegion" v-model="credentials.region"
                               class="ig-text" type="text" spellcheck="false" required autocomplete="off">
                        <i class="ig-helpers"></i>
                        <label class="ig-label">Region</label>
                    </div>
                    <div class="input-group ig-dark">
                        <input id="bucketName" v-model="credentials.bucket"
                               class="ig-text" type="text" spellcheck="false" required autocomplete="off">
                        <i class="ig-helpers"></i>
                        <label class="ig-label">Bucket</label>
                    </div>

                    <button class="lw-btn m-r-25" type="button" @click.prevent="returnHome">
                        <i class="fa fa-level-down" style="transform: rotate(90deg)"></i>
                    </button>

                    <button class="lw-btn" type="submit" @click.prevent="saveSettings">
                        <i class="fa fa-save"></i>
                    </button>
                </form>
            </div>
        </div>
    </div>

</template>

<script>
    import LocalStorage from '../services/localStorage';

    export default {
        name: 'settings',
        components: {},
        data: () => ({
            credentials: {
                accessKeyId: '',
                accessKeySecret: '',
                region: '',
                bucket: ''
            }
        }),
        computed: {},
        mounted() {
            if (LocalStorage.exists('credentials')) {
                this.credentials = LocalStorage.get('credentials');
            }
        },
        methods: {
            returnHome() {
                this.$router.push('/')
            },
            saveSettings() {
                LocalStorage.set('credentials', this.credentials);

                LocalStorage.set('defaultBucket', {
                    name: this.credentials.bucket,
                    region: this.credentials.region
                });

                new Notification('Saved!', {
                    body: 'Your settings were saved.'
                });

                this.$router.push('/')
            }
        }
    }
</script>

<style>

</style>
