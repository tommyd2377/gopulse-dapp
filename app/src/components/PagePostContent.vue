<script setup>
import { ref, watchEffect } from 'vue'
import { PublicKey } from '@solana/web3.js'
import { getPostContent } from '@/api'
import { useFromRoute } from '@/composables'
import PostContentCard from '@/components/PostContentCard'

const postContentAddress = ref(null)
useFromRoute((route) => postContentAddress.value = route.params.postContent)

const loading = ref(false)
const postContent = ref(null)
watchEffect(async () => {
    try {
        loading.value = true
        postContent.value = await getPostContent(new PublicKey(postContentAddress.value))
    } catch (e) {
        postContent.value = null
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <section class="gp-content-stack">
        <div v-if="loading" class="gp-card animate-pulse">
            <div class="h-5 w-48 rounded bg-gray-800"></div>
            <div class="mt-5 h-24 rounded bg-gray-800"></div>
            <div class="mt-5 grid gap-3 md:grid-cols-3">
                <div class="h-16 rounded bg-gray-800"></div>
                <div class="h-16 rounded bg-gray-800"></div>
                <div class="h-16 rounded bg-gray-800"></div>
            </div>
        </div>
        <div v-else-if="!postContent" class="gp-card text-center">
            <h2 class="text-xl font-semibold text-white">Market not found</h2>
            <p class="mx-auto mt-2 max-w-xl gp-muted">
                This content market could not be loaded from the current program and network.
            </p>
            <router-link :to="{ name: 'Feed' }" class="gp-button-secondary mt-5">
                Back to feed
            </router-link>
        </div>
        <post-content-card v-else :postContent="postContent" @delete="$router.push({ name: 'Feed' })"></post-content-card>
    </section>
</template>
