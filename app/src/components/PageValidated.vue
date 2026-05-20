<script setup>
import { ref, watchEffect } from 'vue'
import { paginateposts } from '@/api'
import PostContentList from '@/components/ValidatedPostContentList'
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
            <div class="gp-pill mb-3">Settlement</div>
            <h2 class="text-2xl font-semibold text-white">Validated markets</h2>
            <p class="mt-2 max-w-3xl gp-muted">
                Markets appear here after validator participation reaches the threshold. Collect actions remain wired to the existing poster and validator collection instructions.
            </p>
        </div>

        <div v-if="!wallet" class="gp-card text-center">
            <h2 class="text-xl font-semibold text-white">Connect your wallet to view validated markets.</h2>
            <p class="mx-auto mt-2 max-w-xl gp-muted">
                Wallet connection is required to load the Anchor workspace and collection actions.
            </p>
        </div>

        <post-content-list
            v-else
            v-model:posts="posts"
            :loading="loading"
            :has-more="hasNextPage"
            @more="getNextPage"
        ></post-content-list>
    </section>
</template>
