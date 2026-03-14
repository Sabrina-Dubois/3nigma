<template>
	<div v-if="showButton" class="pwa-hint">
		<button
			type="button"
			class="pwa-fab"
			aria-label="Installer l'application"
			title="Installer l'application"
			@click="installPWA"
		>
			<i class="mdi mdi-cellphone pwa-fab__icon" aria-hidden="true"></i>
		</button>
		<div class="hint-text">{{ t("pwa.button") }}</div>

		<!-- POPUP INSTRUCTIONS -->
		<div v-if="showDialog" class="pwa-modal" role="dialog" aria-modal="true">
			<div class="pwa-modal__backdrop" @click="confirmInstall"></div>
			<div class="pwa-modal__card">
				<div class="pwa-modal__title">
					{{ t("pwa.dialog.title") }}
				</div>

				<!-- Chrome Android -->
				<div class="pwa-modal__text">
					<strong>{{ t("pwa.dialog.android.title") }}</strong><br />
					{{ t("pwa.dialog.android.step1") }}<br />
					{{ t("pwa.dialog.android.step2") }}<br />
					{{ t("pwa.dialog.android.step3") }}
				</div>

				<!-- iOS Safari -->
				<div class="pwa-modal__text">
					<strong>{{ t("pwa.dialog.ios.title") }}</strong><br />
					{{ t("pwa.dialog.ios.step1") }}<br />
					{{ t("pwa.dialog.ios.step2") }}<br />
					{{ t("pwa.dialog.ios.step3") }}<br />
					{{ t("pwa.dialog.ios.step4") }}
				</div>

				<button type="button" class="btn-primary mt-4" @click="confirmInstall">
					{{ t("pwa.dialog.install_button") }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const showDialog = ref(false);
const showButton = ref(false);
let deferredPrompt = null;

function isMobileBrowser() {
	const ua = navigator.userAgent || "";
	const byUserAgent = /Android|iPhone|iPad|iPod/i.test(ua);
	const byPointer = window.matchMedia("(pointer: coarse)").matches;
	return byUserAgent || byPointer;
}

function checkPWAState() {
	const isStandalone =
		window.matchMedia("(display-mode: standalone)").matches ||
		window.navigator.standalone === true;

	showButton.value = !isStandalone && isMobileBrowser();
}

function onBeforeInstallPrompt(e) {
	e.preventDefault();
	deferredPrompt = e;
	// InstallBanner gère Android — on masque le FAB
	showButton.value = false;
}

function onAppInstalled() {
	showButton.value = false;
	deferredPrompt = null;
}

function onVisibilityOrFocus() {
	checkPWAState();
}

onMounted(() => {
	checkPWAState();
	window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
	window.addEventListener("appinstalled", onAppInstalled);
	window.addEventListener("focus", onVisibilityOrFocus);
	document.addEventListener("visibilitychange", onVisibilityOrFocus);
});

onUnmounted(() => {
	window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
	window.removeEventListener("appinstalled", onAppInstalled);
	window.removeEventListener("focus", onVisibilityOrFocus);
	document.removeEventListener("visibilitychange", onVisibilityOrFocus);
});

function installPWA() {
	showDialog.value = true;
}

function confirmInstall() {
	showDialog.value = false;
	if (deferredPrompt) {
		deferredPrompt.prompt();
		deferredPrompt.userChoice.then(() => {
			deferredPrompt = null;
			checkPWAState();
		});
	} else {
		checkPWAState();
	}
}
</script>

<style scoped>
.pwa-hint {
	position: fixed;
	right: 16px;
	bottom: 96px;
	z-index: 120;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	width: fit-content;
}

.pwa-fab {
	width: 64px;
	height: 64px;
	border-radius: 16px;
	background: linear-gradient(145deg, var(--ink3), #2b1406);
	color: var(--parch);
	border: 1px solid rgba(30, 14, 4, 0.35);
	box-shadow:
		0 10px 24px rgba(30, 14, 4, 0.25),
		inset 0 1px 0 rgba(255, 255, 255, 0.12);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.pwa-fab__icon {
	font-size: 30px;
	line-height: 1;
}

.hint-text {
	font-size: 12px;
	font-weight: 700;
	color: var(--ink3);
	background: var(--parch2);
	padding: 6px 12px;
	border-radius: 20px;
	box-shadow: 0 6px 16px rgba(30, 14, 4, 0.18);
	text-align: center;
	white-space: nowrap;
}

.pwa-modal {
	position: fixed;
	inset: 0;
	z-index: 200;
	display: flex;
	align-items: center;
	justify-content: center;
}

.pwa-modal__backdrop {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.55);
}

.pwa-modal__card {
	position: relative;
	z-index: 1;
	background: var(--parch);
	padding: 24px;
	border-radius: 20px;
	max-width: 360px;
	width: calc(100% - 40px);
	box-shadow: 0 20px 40px rgba(30, 14, 4, 0.2);
	text-align: center;
	border: 1px solid var(--border);
}

.pwa-modal__card::before {
	content: "";
	position: absolute;
	border-radius: 16px;
	pointer-events: none;
}

.pwa-modal__card::before {
	inset: 6px;
	border: 1px solid rgba(30, 14, 4, 0.15);
}

.pwa-modal__title {
	font-family: 'Cinzel', serif;
	font-size: 18px;
	letter-spacing: 2px;
	color: var(--ink);
	margin-bottom: 16px;
}

.pwa-modal__text {
	font-family: 'Crimson Pro', serif;
	font-size: 14px;
	color: var(--ink2);
	line-height: 1.6;
	margin-bottom: 16px;
}
</style>
