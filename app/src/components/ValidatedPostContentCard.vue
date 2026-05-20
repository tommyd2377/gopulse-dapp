<script setup>
import { ref, toRefs, computed, onMounted } from 'vue'
import { fetchUser, posterCollect, validatorCollect } from '@/api'
import { useWorkspace } from '@/composables'
import { PublicKey } from '@solana/web3.js'

const props = defineProps({
    postContent: Object,
})

const { postContent } = toRefs(props)
const { wallet } = useWorkspace()
const useravatar = ref('')
const username = ref('')

const isMyPostContent = computed(() => wallet.value && wallet.value.publicKey.toBase58() === postContent.value.poster.toBase58())
const authorRoute = computed(() => {
    if (isMyPostContent.value) {
        return { name: 'Account' }
    }
    return { name: 'Accounts', params: { author: postContent.value.poster.toBase58() } }
})
const outcomeLabel = computed(() => postContent.value.shortWin ? 'Short won' : 'Long won')
const formattedContent = computed(() => escapeHtml(postContent.value.content).replace(/\n/g, '<br>'))
const stats = computed(() => [
    { label: 'Poster stake', value: formatSol(postContent.value.amount) },
    { label: 'Total pool', value: formatSol(postContent.value.totalPool) },
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
</script>

<template>
    <article v-if="postContent.validatorThresholdReached" class="gp-card">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <router-link :to="authorRoute" class="flex min-w-0 items-center gap-3">
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

            <div class="flex flex-wrap gap-2">
                <span class="gp-pill text-blue-100">Closed</span>
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
            <div class="mt-4 break-words rounded-lg border border-slate-800 bg-slate-950 p-4 text-base leading-7 text-slate-100" v-html="formattedContent"></div>
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div v-for="item in stats" :key="item.label" class="gp-stat">
                <div class="text-xs font-semibold uppercase tracking-wide gp-muted">{{ item.label }}</div>
                <div class="mt-1 break-words text-sm font-semibold text-white">{{ item.value }}</div>
            </div>
        </div>

        <div class="mt-5 flex flex-col gap-3 border-t border-slate-800 pt-5 md:flex-row md:items-center md:justify-between">
            <div class="text-sm gp-muted">
                Closed {{ postContent.created_ago }}. Eligible participants can collect from the settled pool.
            </div>
            <div class="flex flex-wrap gap-2">
                <button
                    v-if="isMyPostContent"
                    @click="collectPoster"
                    class="gp-button-primary"
                    title="Poster Collect"
                >
                    Collect creator rewards
                </button>
                <button
                    v-else
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
