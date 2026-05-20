<script setup>
import { computed, toRefs } from 'vue'
import PostContentCard from '@/components/PostContentCard'

const emit = defineEmits(['update:posts', 'more'])
const props = defineProps({
    posts: Array,
    loading: Boolean,
    hasMore: Boolean,
    emptyTitle: {
        type: String,
        default: 'No markets found',
    },
    emptyText: {
        type: String,
        default: 'Try another route or check back after new markets are posted.',
    },
})

const { posts, loading, hasMore, emptyTitle, emptyText } = toRefs(props)

const orderedposts = computed(() => {
    return posts.value.slice().sort((a, b) =>
        b.timestamp - a.timestamp)
})
</script>

<template>
    <div class="grid gap-4">
        <transition-group name="fade" tag="div" class="grid gap-4">
            <post-content-card
                v-for="postContent in orderedposts"
                :key="postContent.key"
                :postContent="postContent"
            ></post-content-card>
        </transition-group>

        <div v-if="loading" class="grid gap-4">
            <div v-for="index in 3" :key="index" class="gp-card animate-pulse">
                <div class="flex items-center gap-3">
                    <div class="h-12 w-12 rounded-lg bg-gray-800"></div>
                    <div class="flex-1">
                        <div class="h-4 w-40 rounded bg-gray-800"></div>
                        <div class="mt-2 h-3 w-28 rounded bg-gray-800"></div>
                    </div>
                </div>
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
            <h3 class="text-lg font-semibold text-white">{{ emptyTitle }}</h3>
            <p class="mx-auto mt-2 max-w-xl gp-muted">{{ emptyText }}</p>
        </div>

        <div v-else-if="hasMore" class="text-center">
            <button @click="emit('more')" class="gp-button-secondary">
                Load more markets
            </button>
        </div>
    </div>
</template>

<style>
.fade-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.fade-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.fade-enter-active {
    transition: all 0.28s ease;
}
</style>
