<script setup>
import { computed, ref, toRefs } from 'vue'
import { useAutoresizeTextarea, useCountCharacterLimit, useSlug } from '@/composables'
import { sendPostContent } from '@/api'
import { useWallet } from 'solana-wallets-vue'
import { WebBundlr } from '@bundlr-network/client'

const props = defineProps({
    forcedTopic: String,
})
const { forcedTopic } = toRefs(props)

const tabs = [
    { id: 'micro', label: 'Micro', hint: 'Short text or a link.' },
    { id: 'blog', label: 'Blog', hint: 'Upload or link a longer post.', accept: 'text/*,application/pdf,application/json,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { id: 'image', label: 'Image', hint: 'Upload image evidence.', accept: 'image/*' },
    { id: 'audio', label: 'Audio', hint: 'Upload audio evidence.', accept: 'audio/*,.mp3,.wav,.ogg,.m4a,.webm' },
    { id: 'video', label: 'Video', hint: 'Upload video evidence.', accept: 'video/*,.mp4,.webm,.mov' },
]

const walletContext = useWallet()
const { connected } = walletContext

const arweaveLink = ref('')
const content = ref('')
const market = ref('')
const amount = ref('')
const activeTab = ref('micro')
const threshold = ref('')
const fileInput = ref(null)
const uploadStatus = ref('')
const uploadError = ref('')
const isUploading = ref(false)
const slugTopic = useSlug(market)
const effectiveTopic = computed(() => forcedTopic.value ?? slugTopic.value)
const activeMode = computed(() => tabs.find(tab => tab.id === activeTab.value) ?? tabs[0])
const isUploadMode = computed(() => Boolean(activeMode.value.accept))

const textarea = ref()
useAutoresizeTextarea(textarea)

const characterLimit = useCountCharacterLimit(content, 420)
const characterLimitColour = computed(() => {
    if (characterLimit.value < 0) return 'text-red-300'
    if (characterLimit.value <= 10) return 'text-yellow-300'
    return 'text-slate-400'
})

const canPostContent = computed(() => Boolean(content.value) && characterLimit.value >= 0 && !isUploading.value)
const postHint = computed(() => {
    if (isUploading.value) return 'Wait for the upload to finish before posting.'
    if (!content.value) return 'Add content or an uploaded Arweave link to open a market.'
    if (characterLimit.value < 0) return 'Content must be 420 characters or fewer.'
    if (!amount.value || !threshold.value) return 'Stake amount and validator threshold are required by the protocol transaction.'
    return 'Ready to create a validation market.'
})

const emit = defineEmits(['added'])
const send = async () => {
    if (! canPostContent.value) return
    const postContent = await sendPostContent(content.value, effectiveTopic.value, amount.value, threshold.value)
    emit('added', postContent)
    market.value = ''
    content.value = ''
    amount.value = ''
    threshold.value = ''
    arweaveLink.value = ''
    uploadStatus.value = ''
    uploadError.value = ''
}

async function uploadViaBundlr(file, contentType) {
    const bundlr = new WebBundlr('https://devnet.bundlr.network', 'solana', walletContext.wallet.value, {
        providerUrl: 'https://api.devnet.solana.com',
    })

    await bundlr.ready()
    const price = await bundlr.getPrice(file.size)
    await bundlr.fund(price)

    const fileContent = await readFileAsync(file)
    const buffer = Buffer.from(fileContent)
    const tags = [{ name: 'Content-Type', value: contentType }]
    const response = await bundlr.upload(buffer, { tags })

    arweaveLink.value = `https://arweave.net/${response.id}`
    console.log(`Data Available at => https://arweave.net/${response.id}`)
}

async function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
            resolve(event.target.result)
        }
        reader.onerror = (event) => {
            reject(event.target.error)
        }
        reader.readAsArrayBuffer(file)
    })
}

const chooseFile = () => {
    if (fileInput.value) fileInput.value.click()
}

const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    uploadError.value = ''
    uploadStatus.value = `Uploading ${file.name} to Arweave through Bundlr...`
    isUploading.value = true

    try {
        await uploadViaBundlr(file, file.type || 'application/octet-stream')
        content.value = arweaveLink.value
        uploadStatus.value = 'Arweave link inserted into the content field.'
    } catch (error) {
        console.error('Error uploading via Bundlr:', error)
        uploadError.value = error instanceof Error ? error.message : 'Upload failed. Try again or paste a link manually.'
        uploadStatus.value = ''
    } finally {
        isUploading.value = false
        event.target.value = ''
    }
}
</script>

<template>
    <div v-if="connected" class="gp-card">
        <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
                <div class="gp-pill mb-3">Create validation market</div>
                <h2 class="text-xl font-semibold text-white">Open a market around content credibility.</h2>
                <p class="mt-2 gp-muted">
                    Add content, define a market prompt, set the validator threshold, and stake SOL into the initial long pool.
                </p>
            </div>
            <div class="gp-pill">{{ activeMode.hint }}</div>
        </div>

        <div class="mb-5 flex flex-wrap gap-2 rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                class="rounded-md px-3 py-2 text-sm font-semibold transition"
                :class="activeTab === tab.id ? 'bg-green-400 text-slate-950' : 'text-slate-300 hover:bg-slate-900 hover:text-white'"
                @click="activeTab = tab.id"
            >
                {{ tab.label }}
            </button>
        </div>

        <div v-if="isUploadMode" class="mb-5 rounded-lg border border-dashed border-slate-700 bg-slate-950 p-4">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <div class="text-sm font-semibold text-white">{{ activeMode.label }} upload</div>
                    <p class="mt-1 text-sm gp-muted">Accepted types: {{ activeMode.accept }}</p>
                </div>
                <button type="button" class="gp-button-secondary" :disabled="isUploading" @click="chooseFile">
                    {{ isUploading ? 'Uploading...' : 'Choose file' }}
                </button>
            </div>
            <input
                ref="fileInput"
                type="file"
                :accept="activeMode.accept"
                class="hidden"
                @change="handleFileUpload"
            >
            <p v-if="uploadStatus" class="mt-3 text-sm text-green-200">{{ uploadStatus }}</p>
            <p v-if="uploadError" class="mt-3 text-sm text-red-200">{{ uploadError }}</p>
        </div>

        <div class="grid gap-4">
            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-200">Content / Link</span>
                <textarea
                    ref="textarea"
                    rows="2"
                    class="gp-input resize-none text-base"
                    style="min-height: 7rem;"
                    placeholder="Paste content, a source link, or an Arweave media link..."
                    v-model="content"
                ></textarea>
            </label>

            <div class="grid gap-4 lg:grid-cols-3">
                <label class="grid gap-2 lg:col-span-1">
                    <span class="text-sm font-semibold text-slate-200">Market prompt</span>
                    <input
                        type="text"
                        placeholder="example-topic"
                        class="gp-input"
                        :value="effectiveTopic"
                        :disabled="forcedTopic"
                        @input="market = $event.target.value"
                    >
                </label>
                <label class="grid gap-2">
                    <span class="text-sm font-semibold text-slate-200">Market size / validator threshold</span>
                    <input
                        type="number"
                        min="3"
                        step="2"
                        placeholder="3"
                        class="gp-input"
                        v-model="threshold"
                    >
                </label>
                <label class="grid gap-2">
                    <span class="text-sm font-semibold text-slate-200">Stake amount in SOL</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.1"
                        class="gp-input"
                        v-model="amount"
                    >
                </label>
            </div>

            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <div :class="characterLimitColour" class="text-sm">{{ characterLimit }} characters left</div>
                    <p class="mt-1 text-xs gp-muted">{{ postHint }}</p>
                </div>
                <button
                    class="gp-button-primary"
                    :disabled="!canPostContent"
                    @click="send"
                >
                    Create market
                </button>
            </div>
        </div>
    </div>

    <div v-else class="gp-card text-center">
        <h2 class="text-lg font-semibold text-white">Connect your wallet to create a validation market.</h2>
        <p class="mx-auto mt-2 max-w-xl gp-muted">
            Posting opens an on-chain content account and funds the initial market pool.
        </p>
    </div>
</template>
