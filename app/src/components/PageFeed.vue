<script setup>
import { ref, watchEffect } from 'vue'
import { WalletMultiButton } from 'solana-wallets-vue'
import { paginateposts } from '@/api'
import PostContentList from '@/components/PostContentList'
import { useWorkspace } from '@/composables'

const posts = ref([])
const { wallet } = useWorkspace()
const filters = ref([])

const onNewPage = newposts => posts.value.push(...newposts)
const { prefetch, hasNextPage, getNextPage, loading } = paginateposts(filters, 20, onNewPage)

watchEffect(() => {
    if (! wallet.value) return
    posts.value = []
    prefetch().then(getNextPage)
})
</script>

<template>
    <section class="gp-content-stack">
        <div class="gp-card">
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div class="gp-pill mb-3">Market feed</div>
                    <h2 class="text-2xl font-semibold text-white">Content credibility, priced by validators.</h2>
                    <p class="mt-2 max-w-3xl gp-muted">
                        GoPulse turns posts into validation markets. Creators open a pool, validators take long or short positions, and rewards resolve when the validator threshold is reached.
                    </p>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center text-xs">
                    <div class="gp-stat">
                        <div class="font-semibold text-white">Long</div>
                        <div class="gp-muted">support</div>
                    </div>
                    <div class="gp-stat">
                        <div class="font-semibold text-white">Short</div>
                        <div class="gp-muted">challenge</div>
                    </div>
                    <div class="gp-stat">
                        <div class="font-semibold text-white">Collect</div>
                        <div class="gp-muted">settle</div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="!wallet" class="gp-card text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-green-400 bg-black text-green-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18M3 12h18" />
                </svg>
            </div>
            <h2 class="text-xl font-semibold text-white">Connect your wallet to view and participate in GoPulse markets.</h2>
            <p class="mx-auto mt-2 max-w-xl gp-muted">
                Wallet connection loads the protocol workspace, feed pagination, and market actions for posting, validation, and collection.
            </p>
            <div class="mx-auto mt-5 max-w-xs">
                <wallet-multi-button></wallet-multi-button>
            </div>
        </div>

        <post-content-list
            v-else
            v-model:posts="posts"
            :loading="loading"
            :has-more="hasNextPage"
            empty-title="No validation markets yet"
            empty-text="Once creators post content markets, they will appear here in newest-first order."
            @more="getNextPage"
        ></post-content-list>
    </section>
</template>
