<script setup>
import { computed, toRefs } from 'vue'
import PostContentCard from '@/components/ValidatedPostContentCard'

const emit = defineEmits(['update:posts', 'more'])
const props = defineProps({
    posts: Array,
    loading: Boolean,
    hasMore: Boolean,
})

const { posts, loading, hasMore } = toRefs(props)
const orderedposts = computed(() => {
    return posts.value.slice().sort((a, b) => b.timestamp - a.timestamp)
})
</script>

<template>
    <div class="grid gap-4">
        <post-content-card
            v-for="postContent in orderedposts"
            :key="postContent.key"
            :postContent="postContent"
        ></post-content-card>

        <div v-if="loading" class="grid gap-4">
            <div v-for="index in 2" :key="index" class="gp-card animate-pulse">
                <div class="h-5 w-44 rounded bg-gray-800"></div>
                <div class="mt-5 h-20 rounded bg-gray-800"></div>
                <div class="mt-5 grid gap-3 md:grid-cols-4">
                    <div class="h-16 rounded bg-gray-800"></div>
                    <div class="h-16 rounded bg-gray-800"></div>
                    <div class="h-16 rounded bg-gray-800"></div>
                    <div class="h-16 rounded bg-gray-800"></div>
                </div>
            </div>
        </div>

        <div v-else-if="orderedposts.length === 0" class="gp-card text-center">
            <h3 class="text-lg font-semibold text-white">No validated markets yet</h3>
            <p class="mx-auto mt-2 max-w-xl gp-muted">
                Closed markets will appear here after the validator threshold is reached.
            </p>
        </div>

        <div v-else-if="hasMore" class="text-center">
            <button @click="emit('more')" class="gp-button-secondary">
                Load more validated markets
            </button>
        </div>
    </div>
</template>
