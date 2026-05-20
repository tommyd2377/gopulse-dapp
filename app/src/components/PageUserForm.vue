<script setup>
import { computed, ref } from 'vue'
import { createUser, updateUser, fetchUser } from '@/api'
import { useWallet, useAnchorWallet } from 'solana-wallets-vue'

const wallet = useAnchorWallet()

const name = ref('')
const avatar = ref('')
const username = ref('')
const useravatar = ref('')
const profileExists = ref(false)
const loadingProfile = ref(true)

const { connected } = useWallet()
const canSaveAccount = computed(() => Boolean(name.value && avatar.value))

if (wallet.value) {
    fetchUser(wallet.value.publicKey).then(res => {
        profileExists.value = true
        username.value = res.name
        useravatar.value = res.avatar
        name.value = res.name
        avatar.value = res.avatar
    }).catch(() => {
        profileExists.value = false
    }).finally(() => {
        loadingProfile.value = false
    })
} else {
    loadingProfile.value = false
}

const setAccount = async () => {
    if (!canSaveAccount.value) return
    await createUser(name.value, avatar.value)
    username.value = name.value
    useravatar.value = avatar.value
    profileExists.value = true
}

const updateAccount = async () => {
    if (!canSaveAccount.value) return
    await updateUser(name.value, avatar.value)
    username.value = name.value
    useravatar.value = avatar.value
}
</script>

<template>
    <div v-if="connected" class="gp-card">
        <div class="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <div class="gp-pill mb-3">Account profile</div>
                <h2 class="text-xl font-semibold text-white">{{ profileExists ? 'Update your GoPulse identity' : 'Create your GoPulse identity' }}</h2>
                <p class="mt-2 gp-muted">
                    Profiles help markets show readable creator names and avatars instead of raw wallet addresses.
                </p>
            </div>
            <div v-if="useravatar || username" class="flex items-center gap-3">
                <img v-if="useravatar" :src="useravatar" alt="Profile avatar preview" class="h-12 w-12 rounded-lg border border-slate-700 object-cover">
                <div>
                    <div class="font-semibold text-white">{{ username || 'Unnamed profile' }}</div>
                    <div class="text-xs gp-muted">{{ profileExists ? 'Existing profile' : 'New profile' }}</div>
                </div>
            </div>
        </div>

        <div v-if="loadingProfile" class="gp-panel text-sm gp-muted">
            Loading profile...
        </div>

        <div v-else class="grid gap-4 md:grid-cols-3 md:items-end">
            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-200">Username</span>
                <input
                    type="text"
                    placeholder="Creator name"
                    class="gp-input"
                    v-model="name"
                >
            </label>

            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-200">Avatar URL</span>
                <input
                    type="url"
                    placeholder="https://..."
                    class="gp-input"
                    v-model="avatar"
                >
            </label>

            <button
                class="gp-button-primary"
                :disabled="!canSaveAccount"
                @click="profileExists ? updateAccount() : setAccount()"
            >
                {{ profileExists ? 'Update profile' : 'Create profile' }}
            </button>
        </div>
    </div>

    <div v-else class="gp-card text-center">
        <h2 class="text-lg font-semibold text-white">Connect your wallet to manage your profile.</h2>
    </div>
</template>
