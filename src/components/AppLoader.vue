<template>
    <div class="fixed inset-0 flex flex-col items-center justify-center z-50" style="background: var(--parch);">
        <!-- Logo -->
        <h1
            style="font-family: 'Cinzel', serif; font-weight: 900; font-size: 32px; color: var(--ink); letter-spacing: 2px;">
            <span style="color: var(--gold)">🗝️ 3</span>NIGMA<span
                style="color: var(--gold); font-size: 44px;">°</span>
        </h1>
        <!-- Spinner -->
        <div class="mt-6 spinner"></div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(138, 96, 48, 0.2);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>