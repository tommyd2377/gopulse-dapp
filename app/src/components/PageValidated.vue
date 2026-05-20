<script setup>
import { onMounted, ref } from 'vue'
import { paginateposts } from '@/api'
import PostContentList from '@/components/ValidatedPostContentList'
import { useWorkspace } from '@/composables'

const posts = ref([])
const { wallet } = useWorkspace()
const filters = ref([])
const validatedError = ref('')

const onNewPage = newposts => posts.value.push(...newposts)
const { prefetch, hasNextPage, getNextPage, loading } = paginateposts(filters, 20, onNewPage)

const loadValidated = async () => {
    posts.value = []
    validatedError.value = ''
    try {
        await prefetch()
        await getNextPage()
    } catch (error) {
        console.error(error)
        validatedError.value = 'Unable to load validated markets from the current network.'
    }
}

onMounted(loadValidated)
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
            <h2 class="text-xl font-semibold text-white">Connect your wallet to collect from validated markets.</h2>
            <p class="mx-auto mt-2 max-w-xl gp-muted">
                Closed markets are visible without a wallet. Collection actions require a connected wallet.
            </p>
        </div>

        <div v-if="validatedError" class="gp-card text-center">
            <h3 class="text-lg font-semibold text-white">Validated markets could not be loaded</h3>
            <p class="mx-auto mt-2 max-w-xl gp-muted">{{ validatedError }}</p>
            <button class="gp-button-secondary mt-5" @click="loadValidated">Retry</button>
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
