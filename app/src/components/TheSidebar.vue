<script setup>
import { computed } from 'vue'
import { WalletMultiButton, useWallet } from 'solana-wallets-vue'

const { connected, publicKey } = useWallet()

const navItems = [
    { name: 'Feed', label: 'Feed', helper: 'Live markets' },
    { name: 'Markets', label: 'Markets', helper: 'Topic discovery' },
    { name: 'Accounts', label: 'Accounts', helper: 'Creators' },
    { name: 'Validated', label: 'Validated', helper: 'Closed markets', requiresWallet: true },
    { name: 'Account', label: 'Profile', helper: 'Your account', requiresWallet: true },
]

const visibleNavItems = computed(() => navItems.filter(item => !item.requiresWallet || connected.value))

const shortAddress = (key) => {
    if (!key) return ''
    const address = key.toBase58()
    return `${address.slice(0, 4)}...${address.slice(-4)}`
}
</script>

<template>
    <aside class="gp-card flex h-full flex-col justify-between p-4">
        <div>
            <router-link :to="{ name: 'Feed' }" class="mb-6 flex items-center gap-3">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-purple-500 bg-black shadow-lg">
                    <img src="/gp.png" alt="GoPulse logo" class="h-full w-full object-cover">
                </span>
                <span class="min-w-0">
                    <span class="block text-lg font-semibold text-white">GoPulse</span>
                    <span class="block text-xs gp-muted">Validation markets</span>
                </span>
            </router-link>

            <nav class="grid gap-2">
                <router-link
                    v-for="item in visibleNavItems"
                    :key="item.name"
                    :to="{ name: item.name }"
                    custom
                    v-slot="{ href, navigate, isActive }"
                >
                    <a
                        :href="href"
                        class="group flex items-center gap-3 rounded-md border px-3 py-3 transition"
                        :class="isActive ? 'border-green-400 text-white shadow-lg' : 'border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900'"
                        :style="isActive ? 'background: linear-gradient(90deg, rgba(153,69,255,0.2), rgba(20,241,149,0.12)); box-shadow: 0 0 28px rgba(20,241,149,0.12);' : ''"
                        @click="navigate"
                    >
                        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-950 text-slate-300 group-hover:text-white">
                            <svg v-if="item.name === 'Feed'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 5h16M4 12h16M4 19h10" />
                            </svg>
                            <svg v-else-if="item.name === 'Markets'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 18V6m5 12V9m5 9V4m5 14v-7" />
                            </svg>
                            <svg v-else-if="item.name === 'Accounts'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16 11a4 4 0 10-8 0m8 0a4 4 0 11-8 0m8 0c2.21.57 4 2.15 4 4.5V18H4v-2.5c0-2.35 1.79-3.93 4-4.5" />
                            </svg>
                            <svg v-else-if="item.name === 'Validated'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M20 6L9 17l-5-5" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" />
                            </svg>
                        </span>
                        <span class="min-w-0">
                            <span class="block text-sm font-semibold">{{ item.label }}</span>
                            <span class="block text-xs gp-muted">{{ item.helper }}</span>
                        </span>
                    </a>
                </router-link>
            </nav>
        </div>

        <div class="mt-6 grid gap-3">
            <div class="gp-panel p-3">
                <div class="flex items-center justify-between gap-3">
                    <span class="text-xs font-semibold uppercase tracking-wide gp-muted">Network</span>
                    <span class="gp-pill">Devnet</span>
                </div>
                <p class="mt-2 text-xs gp-muted">
                    {{ connected ? shortAddress(publicKey) : 'Connect to participate.' }}
                </p>
            </div>
            <wallet-multi-button></wallet-multi-button>
        </div>
    </aside>
</template>
