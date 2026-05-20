<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { paginateposts, marketFilter } from '@/api'
import { useSlug, useFromRoute } from '@/composables'
import PostContentList from '@/components/PostContentList'
import PostSearch from '@/components/PostSearch'

const router = useRouter()
const posts = ref([])
const market = ref('')
const slugTopic = useSlug(market)
const viewedTopic = ref('')
const filters = ref([])

const onNewPage = newposts => posts.value.push(...newposts)
const { prefetch, hasNextPage, getNextPage, loading } = paginateposts(filters, 10, onNewPage)

const search = () => {
    router.push(`/markets/${slugTopic.value}`)
}

const fetchTopicposts = () => {
    if (slugTopic.value === viewedTopic.value) return
    posts.value = []
    viewedTopic.value = slugTopic.value
    filters.value = [marketFilter(slugTopic.value)]
    prefetch().then(getNextPage)
}
fetchTopicposts()

useFromRoute((route) => {
    market.value = route.params.market
    if (market.value) {
        fetchTopicposts()
    } else {
        posts.value = []
        viewedTopic.value = ''
    }
})
</script>

<template>
    <section class="gp-content-stack">
        <div class="gp-card">
            <div class="gp-pill mb-3">Market discovery</div>
            <h2 class="text-2xl font-semibold text-white">Explore markets</h2>
            <p class="mt-2 max-w-3xl gp-muted">
                Search by topic to see related validation markets. Topics map to the on-chain market prompt used when creators post content.
            </p>
        </div>

        <post-search placeholder="Search a market topic" :disabled="!slugTopic" :modelValue="slugTopic" @update:modelValue="value => market = value" @search="search">
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z" clip-rule="evenodd" />
                </svg>
            </template>
        </post-search>

        <div v-if="viewedTopic" class="gp-content-stack">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div class="text-sm font-semibold uppercase tracking-wide gp-muted">Results for</div>
                    <h3 class="text-xl font-semibold text-white">#{{ viewedTopic }}</h3>
                </div>
            </div>
            <post-content-list
                v-model:posts="posts"
                :loading="loading"
                :has-more="hasNextPage"
                :empty-title="`No markets found for #${viewedTopic}`"
                empty-text="Try a different topic or create the first market for this prompt from your profile."
                @more="getNextPage"
            ></post-content-list>
        </div>

        <div v-else class="gp-card text-center">
            <h3 class="text-lg font-semibold text-white">Search a topic to discover validation markets.</h3>
            <p class="mx-auto mt-2 max-w-xl gp-muted">Examples: protocol updates, product claims, media links, creator posts.</p>
        </div>
    </section>
</template>
