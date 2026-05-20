<script setup>
import { ref, watchEffect } from 'vue'
import { paginateposts, authorFilter, fetchUser } from '@/api'
import PostContentForm from '@/components/PostContentForm'
import PostContentList from '@/components/PostContentList'
import PageUserForm from '@/components/PageUserForm'
import { useWorkspace } from '@/composables'

const posts = ref([])
const { wallet } = useWorkspace()
const filters = ref([])
const update = ref(false)
const username = ref('')
const useravatar = ref('')
const loadingProfile = ref(false)
const profileError = ref('')

const onNewPage = newposts => posts.value.push(...newposts)
const { prefetch, hasNextPage, getNextPage, loading } = paginateposts(filters, 10, onNewPage)

watchEffect(() => {
    if (!wallet.value) return

    const publicKey = wallet.value.publicKey
    posts.value = []
    filters.value = [authorFilter(publicKey.toBase58())]
    prefetch().then(getNextPage)

    loadingProfile.value = true
    profileError.value = ''
    fetchUser(publicKey).then(res => {
        username.value = res.name
        useravatar.value = res.avatar
    }).catch(() => {
        username.value = ''
        useravatar.value = ''
        profileError.value = 'No profile found yet. Create one from Settings.'
    }).finally(() => {
        loadingProfile.value = false
    })
})

const addPostContent = postContent => {
    if (postContent) {
        posts.value.push(postContent)
        return
    }
    posts.value = []
    prefetch().then(getNextPage)
}

function toggleSettings() {
    update.value = !update.value
}
</script>

<template>
    <section class="gp-content-stack">
        <div v-if="wallet" class="gp-card">
            <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div class="flex min-w-0 items-center gap-4">
                    <img
                        v-if="useravatar"
                        class="h-20 w-20 rounded-lg border border-slate-700 object-cover"
                        :src="useravatar"
                        alt="Profile avatar"
                    >
                    <div v-else class="flex h-20 w-20 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-lg font-semibold text-green-300">
                        GP
                    </div>
                    <div class="min-w-0">
                        <div class="gp-pill mb-2">Creator profile</div>
                        <h2 class="truncate text-2xl font-semibold text-white">
                            {{ loadingProfile ? 'Loading profile...' : (username || 'Unnamed GoPulse account') }}
                        </h2>
                        <p class="mt-1 break-all text-sm gp-muted">{{ wallet.publicKey.toBase58() }}</p>
                        <p v-if="profileError" class="mt-2 text-sm text-yellow-200">{{ profileError }}</p>
                    </div>
                </div>
                <button class="gp-button-secondary" @click="toggleSettings">
                    {{ update ? 'Close settings' : 'Settings' }}
                </button>
            </div>
        </div>

        <div v-else class="gp-card text-center">
            <h2 class="text-xl font-semibold text-white">Connect your wallet to view your profile.</h2>
            <p class="mx-auto mt-2 max-w-xl gp-muted">
                Your account page contains profile settings and the markets you have created.
            </p>
        </div>

        <page-user-form v-if="wallet && update"></page-user-form>
        <post-content-form v-if="wallet" @added="addPostContent"></post-content-form>
        <post-content-list
            v-if="wallet"
            v-model:posts="posts"
            :loading="loading"
            :has-more="hasNextPage"
            empty-title="You have not created any markets yet"
            empty-text="Create a validation market above and it will appear in your profile feed."
            @more="getNextPage"
        ></post-content-list>
    </section>
</template>
