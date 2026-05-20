<script setup>
import { ref, toRefs, computed, onMounted } from 'vue'
import { fetchUser, posterCollect, validatorCollect } from '@/api'
import { useWorkspace } from '@/composables'
import GoLongForm from './GoLongForm'
import GoShortForm from './GoShortForm'
import { PublicKey } from '@solana/web3.js'

const props = defineProps({
    postContent: Object,
})

const { postContent } = toRefs(props)
const { wallet } = useWorkspace()

const useravatar = ref('')
const username = ref('')
const mayGoLong = ref(false)
const mayGoShort = ref(false)

const isMyPostContent = computed(() => wallet.value && wallet.value.publicKey.toBase58() === postContent.value.poster.toBase58())
const authorRoute = computed(() => {
    if (isMyPostContent.value) {
        return { name: 'Account' }
    }
    return { name: 'Accounts', params: { author: postContent.value.poster.toBase58() } }
})
const marketOpen = computed(() => !postContent.value.validatorThresholdReached)
const statusLabel = computed(() => marketOpen.value ? 'Open' : 'Closed')
const outcomeLabel = computed(() => {
    if (marketOpen.value) return 'Pricing'
    return postContent.value.shortWin ? 'Short won' : 'Long won'
})
const formattedContent = computed(() => formatContent(postContent.value.content))

const stats = computed(() => [
    { label: 'Poster stake', value: formatSol(postContent.value.amount) },
    { label: 'Market size', value: `${postContent.value.threshold} validators` },
    { label: 'Total pool', value: formatSol(postContent.value.totalPool) },
    { label: 'Validators', value: `${postContent.value.validatorCount}/${postContent.value.threshold}` },
    { label: 'Long pool', value: formatSol(postContent.value.longPool) },
    { label: 'Short pool', value: formatSol(postContent.value.shortPool) },
])

const collectPoster = async () => {
    await posterCollect(postContent.value.postCounter)
}

const collectValidator = async () => {
    await validatorCollect(postContent.value.poster, postContent.value.postCounter)
}

onMounted(async () => {
    try {
        const publicKey = new PublicKey(postContent.value.poster.toBase58())
        const user = await fetchUser(publicKey)
        useravatar.value = user.avatar
        username.value = user.name
    } catch (error) {
        console.log(error)
    }
})

function formatSol(value) {
    const numeric = Number(value || 0)
    return `${numeric.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }[character]))
}

function isYouTubeLink(url) {
    return /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/.test(url)
}

function extractYouTubeVideoId(url) {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? match[1] : null
}

function renderUrl(url) {
    try {
        const parsed = new URL(url)
        if (!['http:', 'https:'].includes(parsed.protocol)) return escapeHtml(url)
        const safeHref = escapeHtml(parsed.href)
        if (isYouTubeLink(url)) {
            const videoId = extractYouTubeVideoId(url)
            if (videoId) {
                return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer"><img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="YouTube preview"></a>`
            }
        }
        return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`
    } catch {
        return escapeHtml(url)
    }
}

function formatContent(content) {
    const raw = String(content ?? '')
    const urlRegex = /https?:\/\/[^\s<>"']+/g
    let result = ''
    let cursor = 0
    raw.replace(urlRegex, (url, offset) => {
        result += escapeHtml(raw.slice(cursor, offset))
        result += renderUrl(url)
        cursor = offset + url.length
        return url
    })
    result += escapeHtml(raw.slice(cursor))
    return result.replace(/\n/g, '<br>')
}
</script>

<template>
    <go-long-form v-if="mayGoLong" :postContent="postContent" @close="mayGoLong = false"></go-long-form>
    <go-short-form v-else-if="mayGoShort" :postContent="postContent" @close="mayGoShort = false"></go-short-form>

    <article v-else class="gp-card">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div class="min-w-0">
                <router-link :to="authorRoute" class="flex items-center gap-3">
                    <img
                        v-if="useravatar"
                        class="h-12 w-12 rounded-lg border border-slate-700 object-cover"
                        :src="useravatar"
                        alt="Creator avatar"
                    >
                    <span v-else class="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-sm font-semibold text-green-300">
                        GP
                    </span>
                    <span class="min-w-0">
                        <span class="block truncate font-semibold text-white">{{ username || 'GoPulse creator' }}</span>
                        <span class="block break-all text-xs gp-muted">{{ postContent.author_display }}</span>
                    </span>
                </router-link>
                <div class="mt-3 flex flex-wrap items-center gap-2 text-xs gp-muted">
                    <router-link :to="{ name: 'PostContent', params: { postContent: postContent.publicKey.toBase58() } }" class="hover:text-white">
                        {{ postContent.created_ago }}
                    </router-link>
                    <span>•</span>
                    <span>{{ postContent.created_at }}</span>
                    <span v-if="isMyPostContent" class="gp-pill">You posted this</span>
                </div>
            </div>

            <div class="flex flex-wrap gap-2">
                <span class="gp-pill" :class="marketOpen ? 'text-green-200' : 'text-blue-100'">{{ statusLabel }}</span>
                <span class="gp-pill">{{ outcomeLabel }}</span>
            </div>
        </div>

        <div class="mt-5">
            <router-link
                v-if="postContent.market"
                :to="{ name: 'Markets', params: { market: postContent.market } }"
                class="gp-pill normal-case tracking-normal hover:border-green-300 hover:text-white"
            >
                #{{ postContent.market }}
            </router-link>
            <div class="gp-link-content mt-4 break-words rounded-lg border border-slate-800 bg-slate-950 p-4 text-base leading-7 text-slate-100" v-html="formattedContent"></div>
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div v-for="item in stats" :key="item.label" class="gp-stat">
                <div class="text-xs font-semibold uppercase tracking-wide gp-muted">{{ item.label }}</div>
                <div class="mt-1 break-words text-sm font-semibold text-white">{{ item.value }}</div>
            </div>
        </div>

        <div class="mt-5 flex flex-col gap-3 border-t border-slate-800 pt-5 md:flex-row md:items-center md:justify-between">
            <p class="text-sm gp-muted">
                Long supports the content outcome. Short challenges it. Markets close when the validator threshold is reached.
            </p>
            <div class="flex flex-wrap gap-2">
                <button
                    v-if="!isMyPostContent && marketOpen"
                    @click="mayGoLong = true"
                    class="gp-button-primary"
                    title="Go Long"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 14l6-6 4 4 6-8" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14 4h6v6" />
                    </svg>
                    Long
                </button>
                <button
                    v-if="!isMyPostContent && marketOpen"
                    @click="mayGoShort = true"
                    class="gp-button-secondary"
                    title="Go Short"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 10l6 6 4-4 6 8" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14 20h6v-6" />
                    </svg>
                    Short
                </button>
                <button
                    v-if="postContent.validatorThresholdReached && isMyPostContent"
                    @click="collectPoster"
                    class="gp-button-primary"
                    title="Poster Collect"
                >
                    Collect creator rewards
                </button>
                <button
                    v-if="postContent.validatorThresholdReached && !isMyPostContent"
                    @click="collectValidator"
                    class="gp-button-primary"
                    title="Validator Collect"
                >
                    Collect validator rewards
                </button>
            </div>
        </div>
    </article>
</template>
