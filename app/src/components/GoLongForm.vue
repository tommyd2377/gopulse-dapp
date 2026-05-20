<script setup>
import { computed, ref, toRefs } from 'vue'
import { validateContent } from '@/api'
import { useWallet } from 'solana-wallets-vue'

const props = defineProps({
    postContent: Object,
})
const { postContent } = toRefs(props)

const amount = ref('')
const { connected } = useWallet()
const canValidate = computed(() => Number(amount.value) > 0)

const emit = defineEmits(['close'])
const validate = async () => {
    if (!canValidate.value) return
    await validateContent(postContent.value, amount.value, 'long')
    emit('close')
}
</script>

<template>
    <div v-if="connected" class="gp-card border-green-400">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
                <div class="gp-pill mb-3 text-green-200">Go Long</div>
                <h2 class="text-xl font-semibold text-white">Support this content outcome.</h2>
                <p class="mt-2 gp-muted">
                    Long validators stake with the creator-side pool. If long wins when the market closes, eligible long participants can collect.
                </p>
            </div>
            <router-link
                :to="{ name: 'PostContent', params: { postContent: postContent.publicKey.toBase58() } }"
                class="gp-pill normal-case tracking-normal"
            >
                {{ postContent.author_display }} • {{ postContent.created_ago }}
            </router-link>
        </div>

        <div class="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-4 text-slate-100 break-words">
            {{ postContent.content }}
        </div>

        <div class="mt-5 grid gap-4 md:grid-cols-3 md:items-end">
            <label class="grid gap-2 md:col-span-2">
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
            <div class="flex flex-wrap gap-2">
                <button class="gp-button-secondary" @click="emit('close')">
                    Cancel
                </button>
                <button class="gp-button-primary" :disabled="!canValidate" @click="validate">
                    Confirm Long
                </button>
            </div>
        </div>
    </div>

    <div v-else class="gp-card text-center">
        <h2 class="text-lg font-semibold text-white">Connect your wallet to go long.</h2>
    </div>
</template>
