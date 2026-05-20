<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchUser, paginateposts, authorFilter } from '@/api'
import { useFromRoute } from '@/composables'
import PostContentList from '@/components/PostContentList'
import PostSearch from '@/components/PostSearch'
import { PublicKey } from '@solana/web3.js'

const router = useRouter()
const posts = ref([])
const author = ref('')
const viewedAuthor = ref('')
const filters = ref([])
const username = ref('')
const authority = ref('')
const useravatar = ref('')
const profileError = ref('')
const loadingProfile = ref(false)

const onNewPage = newposts => posts.value.push(...newposts)
const { prefetch, hasNextPage, getNextPage, loading } = paginateposts(filters, 10, onNewPage)

const search = () => {
    router.push(`/users/${author.value}`)
}

const fetchAuthorProfile = () => {
    username.value = ''
    authority.value = ''
    useravatar.value = ''
    profileError.value = ''

    try {
        const publicKey = new PublicKey(author.value)
        loadingProfile.value = true
        fetchUser(publicKey).then(res => {
            username.value = res.name
            useravatar.value = res.avatar
            authority.value = res.authority.toBase58 ? res.authority.toBase58() : String(res.authority)
        }).catch(() => {
            authority.value = author.value
            profileError.value = 'No profile metadata found for this wallet.'
        }).finally(() => {
            loadingProfile.value = false
        })
    } catch (error) {
        authority.value = author.value
        profileError.value = 'Enter a valid Solana wallet address.'
        loadingProfile.value = false
    }
}

const fetchAuthorposts = () => {
    if (author.value === viewedAuthor.value) return
    posts.value = []
    viewedAuthor.value = author.value
    try {
        new PublicKey(author.value)
    } catch (error) {
        username.value = ''
        useravatar.value = ''
        profileError.value = 'Enter a valid Solana wallet address.'
        authority.value = author.value
        return
    }
    filters.value = [authorFilter(author.value)]
    prefetch().then(getNextPage)
    fetchAuthorProfile()
}

useFromRoute((route) => {
    author.value = route.params.author
    if (author.value) {
        fetchAuthorposts()
    } else {
        posts.value = []
        viewedAuthor.value = ''
        username.value = ''
        authority.value = ''
        useravatar.value = ''
        profileError.value = ''
    }
})
</script>

<template>
    <section class="gp-content-stack">
        <div class="gp-card">
            <div class="gp-pill mb-3">Account lookup</div>
            <h2 class="text-2xl font-semibold text-white">Find creator markets by wallet.</h2>
            <p class="mt-2 max-w-3xl gp-muted">
                Search a Solana public key to view profile metadata and markets created by that address.
            </p>
        </div>

        <post-search placeholder="Solana public key" :disabled="!author" v-model="author" @search="search">
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            </template>
        </post-search>

        <div v-if="viewedAuthor" class="gp-card">
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
                    <div class="gp-pill mb-2">Creator account</div>
                    <h2 class="truncate text-2xl font-semibold text-white">
                        {{ loadingProfile ? 'Loading profile...' : (username || 'Unknown creator') }}
                    </h2>
                    <p class="mt-1 break-all text-sm gp-muted">{{ authority || viewedAuthor }}</p>
                    <p v-if="profileError" class="mt-2 text-sm text-yellow-200">{{ profileError }}</p>
                </div>
            </div>
        </div>

        <post-content-list
            v-if="viewedAuthor"
            v-model:posts="posts"
            :loading="loading"
            :has-more="hasNextPage"
            empty-title="No markets found for this account"
            empty-text="This wallet has not created markets on the current network, or the address could not be found."
            @more="getNextPage"
        ></post-content-list>
    </section>
</template>
