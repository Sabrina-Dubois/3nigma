<template>
    <div class="enigma-screen" :class="{ 'enigma-screen--star': useStarBg }">

        <!-- fond animé -->
        <div class="enigma-bg"></div>
        <div class="enigma-overlay"></div>

        <!-- contenu -->
        <div class="enigma-container">

            <EnigmaSlider v-if="enigma?.type === 'slider'" :enigma="enigma" :answer-error="answerError"
                @submit="emit('submit', $event)" />

            <EnigmaScratch v-else-if="enigma?.type === 'scratch'" :enigma="enigma" :answer-error="answerError"
                @submit="emit('submit', $event)" />

            <EnigmaTuner v-else-if="enigma?.type === 'tuner'" :enigma="enigma" :answer-error="answerError"
                @submit="emit('submit', $event)" />

            <EnigmaSuperposition v-else-if="enigma?.type === 'superposition'" :enigma="enigma" :answer-error="answerError"
                @submit="emit('submit', $event)" />

            <EnigmaCipher v-else-if="enigma?.type === 'cipher'" :enigma="enigma" :answer-error="answerError"
                @submit="emit('submit', $event)" />

            <EnigmaAudio v-else-if="enigma?.type === 'audio'" :enigma="enigma" :answer-error="answerError"
                @submit="emit('submit', $event)" />

            <EnigmaChoice v-else-if="enigma?.type === 'choice'" :enigma="enigma" :answer-error="answerError"
                @submit="emit('submit', $event)" />

            <EnigmaEnvelope v-else-if="enigma?.type === 'envelope'" :enigma="enigma" :answer-error="answerError"
                @submit="emit('submit', $event)" />

            <EnigmaSpotDifference v-else-if="enigma?.type === 'spot_difference'" :enigma="enigma" :answer-error="answerError"
                @submit="emit('submit', $event)" />

            <EnigmaBook v-else-if="enigma?.type === 'book'" :enigma="enigma" :answer-error="answerError"
                @submit="emit('submit', $event)" />

            <EnigmaPadlock v-else-if="enigma?.type === 'padlock'" :enigma="enigma" :answer-error="answerError"
                @submit="emit('submit', $event)" />

            <div v-else class="enigma-card" :class="{ 'enigma-card--error': answerError }">
                <div v-if="enigma?.question" class="enigma-question">
                    {{ enigma.question }}
                </div>

                <form class="enigma-form" @submit.prevent="onSubmit">
                    <input ref="answerInput" v-model="answer" type="text" class="enigma-input"
                        placeholder="Votre réponse..." autocomplete="off" autocapitalize="characters" />

                    <button class="enigma-button">
                        Valider
                    </button>
                </form>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import EnigmaSlider from "@/components/EnigmaSlider.vue"
import EnigmaScratch from "@/components/EnigmaScratch.vue"
import EnigmaTuner from "@/components/EnigmaTuner.vue"
import EnigmaSuperposition from "@/components/EnigmaSuperposition.vue"
import EnigmaCipher from "@/components/EnigmaCipher.vue"
import EnigmaAudio from "@/components/EnigmaAudio.vue"
import EnigmaChoice from "@/components/EnigmaChoice.vue"
import EnigmaEnvelope from "@/components/EnigmaEnvelope.vue"
import EnigmaSpotDifference from "@/components/EnigmaSpotDifference.vue"
import EnigmaBook from "@/components/EnigmaBook.vue"
import EnigmaPadlock from "@/components/EnigmaPadlock.vue"

const props = defineProps({
    enigma: { type: Object, required: true },
    answerError: { type: Boolean, default: false },
    useStarBg: { type: Boolean, default: false },
    solved: { type: Boolean, default: false },
})

const emit = defineEmits(["submit"])

const answer = ref("")
const answerInput = ref(null)

function onSubmit() {
    if (!answer.value.trim()) return
    emit("submit", answer.value.trim())
}

function focusInput() {
    if (answerInput.value) {
        answerInput.value.focus()
    }
}

onMounted(() => {
    focusInput()
})

watch(
    () => props.enigma?.id,
    () => {
        answer.value = ""
        focusInput()
    }
)
</script>

<style scoped>
.enigma-screen {
    position: relative;
    min-height: 100vh;
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 96px; /* évite la BottomNav */
}

/* fond animé */

.enigma-bg {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(circle at center, #111 0%, #000 80%);

    animation: slowZoom 25s ease-in-out infinite;
}

@keyframes slowZoom {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.08);
    }

    100% {
        transform: scale(1);
    }
}

.enigma-screen--star .enigma-bg {
    background: transparent;
    animation: none;
}

.enigma-screen--star .enigma-overlay {
    background: transparent;
}

/* overlay */

.enigma-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle,
            rgba(0, 0, 0, 0.2) 0%,
            rgba(0, 0, 0, 0.55) 85%);
}

/* contenu */

.enigma-container {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 420px;
    padding: 1.5rem;
}

/* carte */

.enigma-card {
    background: var(--parch, #f2e8d0);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.enigma-card--error {
    animation: shake .35s;
}

/* animation erreur */

@keyframes shake {
    0% {
        transform: translateX(0)
    }

    25% {
        transform: translateX(-6px)
    }

    50% {
        transform: translateX(6px)
    }

    75% {
        transform: translateX(-4px)
    }

    100% {
        transform: translateX(0)
    }
}

/* question */

.enigma-question {
    font-family: 'Crimson Pro', serif;
    font-size: 1.1rem;
    line-height: 1.5;
    color: #3a1e0a;
    margin-bottom: 1rem;
}

/* form */

.enigma-form {
    display: flex;
    flex-direction: column;
    gap: .7rem;
}

.enigma-input {
    padding: .75rem 1rem;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, .15);
    font-family: 'Crimson Pro', serif;
    font-size: 1rem;
}

.enigma-input:focus {
    outline: none;
    border-color: #5a3818;
}

.enigma-button {
    background: #5a3818;
    color: #fff;
    border: none;
    padding: .75rem;
    border-radius: 8px;
    font-family: 'Cinzel', serif;
    font-size: .8rem;
    letter-spacing: .2em;
    cursor: pointer;
    transition: .2s;
}

.enigma-button:hover {
    opacity: .9;
}
</style>
