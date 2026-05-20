<template>
    <div class="gp-card text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-300">
            404
        </div>
        <h2 class="text-xl font-semibold text-white">This GoPulse route does not exist.</h2>
        <p class="mx-auto mt-2 max-w-xl gp-muted">
            Return to the live market feed and continue from a known protocol surface.
        </p>
        <router-link :to="{ name: 'Feed' }" class="gp-button-primary mt-5">
            Back to feed
        </router-link>
    </div>
</template>
