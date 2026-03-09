<template>
  <div class="min-h-screen flex flex-col items-center justify-start px-4 pt-6 pb-12" style="background: var(--parch)">
    <div class="text-center mb-10">
      <h1
        style="font-family: 'Cinzel', serif; font-weight: 900; font-size: 38px; color: var(--ink); letter-spacing: 2px;">
        <span style="color: var(--gold)">🗝️ 3</span>NIGMA<span
          style="color: var(--gold); font-size: 55px;">°</span>
      </h1>
      <p
        style="font-family: 'IM Fell English', serif; font-style: italic; color: var(--sepia); font-size: 18px; margin-top: 6px;">
        Chaque jour, une clé. Chaque clé, une vérité.
      </p>
    </div>

    <div class="w-full max-w-3xl rounded p-8 relative"
      style="background: var(--parch2); border: 1px solid var(--border); box-shadow: 0 4px 20px var(--shadow);">
      <div class="absolute inset-2 rounded pointer-events-none" style="border: 1px solid var(--border)"></div>

      <p
        style="font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 3px; color: var(--sepia); text-transform: uppercase; text-align: center;">
        Erreur de navigation
      </p>
      <h2
        style="font-family: 'Cinzel', serif; font-size: 28px; font-weight: 900; letter-spacing: 2px; color: var(--ink); margin-top: 10px; text-align: center;">
        404 — Dossier introuvable
      </h2>

      <div class="mt-8 grid gap-4">
        <article class="rounded p-5" style="background: var(--parch); border: 1px solid var(--border);">
          <h3 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: var(--ink);">
            Cette piste ne mène nulle part…
          </h3>
          <p style="font-family: 'Crimson Pro', serif; font-size: 18px; color: var(--ink2); margin-top: 10px; line-height: 1.45;">
            Le document que vous cherchez semble avoir disparu des archives.
          </p>
          <p style="font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 2px; color: var(--sepia); margin-top: 10px; text-transform: uppercase;">
            Bouton : 🕵️ Retourner à l’enquête
          </p>
        </article>

        <article class="rounded p-5" style="background: var(--parch); border: 1px solid var(--border);">
          <h3 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: var(--ink);">
            404 — Mauvaise piste
          </h3>
          <p style="font-family: 'Crimson Pro', serif; font-size: 18px; color: var(--ink2); margin-top: 10px; line-height: 1.45;">
            Même les meilleurs enquêteurs se trompent parfois de piste.
            La page que vous cherchez n’existe pas.
            Mais une autre énigme vous attend sûrement.
          </p>
          <p style="font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 2px; color: var(--sepia); margin-top: 10px; text-transform: uppercase;">
            Bouton : 🕵️ Reprendre l’enquête
          </p>
        </article>

        <article class="rounded p-5" style="background: var(--parch); border: 1px solid var(--border);">
          <h3 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: var(--ink);">
            404 — Page disparue
          </h3>
          <p style="font-family: 'Crimson Pro', serif; font-size: 18px; color: var(--ink2); margin-top: 10px; line-height: 1.45;">
            Quelqu’un est passé avant vous.
            La page que vous cherchez a été retirée des archives.
            Heureusement, l’enquête comporte encore de nombreuses pistes.
          </p>
          <p style="font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 2px; color: var(--sepia); margin-top: 10px; text-transform: uppercase;">
            Bouton : 📜 Retour aux enquêtes
          </p>
        </article>

        <article class="rounded p-5" style="background: var(--parch); border: 1px solid var(--border);">
          <h3 style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: var(--ink);">
            404 — Dossier manquant
          </h3>
          <p style="font-family: 'Crimson Pro', serif; font-size: 18px; color: var(--ink2); margin-top: 10px; line-height: 1.45;">
            Le dossier que vous tentez d’ouvrir est introuvable.
            Nos archives ont peut-être été altérées, ou la piste que vous suivez n’existe tout simplement pas.
            Revenez au centre d’enquête pour continuer votre mission.
          </p>
          <p style="font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 2px; color: var(--sepia); margin-top: 10px; text-transform: uppercase;">
            Bouton : 🏛 Retour au quartier général
          </p>
        </article>
      </div>

      <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <router-link to="/"
          class="btn-primary btn-block">
          Retour à l'accueil
        </router-link>
        <router-link to="/login"
          class="btn-primary btn-block">
          Se connecter
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>