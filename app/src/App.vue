<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TheSidebar from './components/TheSidebar'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { initWallet } from 'solana-wallets-vue'
import { initWorkspace } from '@/composables'

const route = useRoute()

const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
]

const routeCopy = {
    Feed: {
        title: 'Live validation markets',
        subtitle: 'Post content, stake a position, and let validators price its credibility.',
    },
    Markets: {
        title: 'Explore markets',
        subtitle: 'Search by topic to see related validation markets.',
    },
    Accounts: {
        title: 'Accounts',
        subtitle: 'Review creator and validator activity by wallet address.',
    },
    Validated: {
        title: 'Validated markets',
        subtitle: 'Track closed markets and collect eligible rewards.',
    },
    Account: {
        title: 'Profile',
        subtitle: 'Manage your GoPulse profile and created markets.',
    },
    PostContent: {
        title: 'Market detail',
        subtitle: 'Inspect one validation market and its current pool state.',
    },
    NotFound: {
        title: 'Page not found',
        subtitle: 'The requested GoPulse route does not exist.',
    },
}

const pageCopy = computed(() => routeCopy[route.name] ?? routeCopy.Feed)

initWallet({ wallets, autoConnect: true })
initWorkspace()
</script>

<template>
    <div class="app-shell">
        <div class="gp-shell-grid">
            <the-sidebar class="gp-sidebar"></the-sidebar>

            <main class="gp-main">
                <header class="gp-page-header">
                    <div>
                        <div class="gp-pill mb-2">GoPulse Protocol</div>
                        <h1 class="text-2xl md:text-3xl font-semibold tracking-normal text-white">
                            {{ pageCopy.title }}
                        </h1>
                        <p class="mt-2 max-w-3xl text-sm md:text-base gp-muted">
                            {{ pageCopy.subtitle }}
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="gp-pill">Devnet</span>
                        <span class="gp-pill">Prototype</span>
                    </div>
                </header>

                <router-view></router-view>
            </main>
        </div>
    </div>
</template>
