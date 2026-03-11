// supabase/functions/check-answer/index.js
// DEV-19 — Edge Function POST /check-answer
// ⚠️  La réponse correcte ne doit JAMAIS être retournée au client

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // ── CORS preflight ──
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── 1. Vérifier le JWT ──
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Client avec le JWT de l'utilisateur (pour vérifier l'identité)
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY'),
      { global: { headers: { Authorization: authHeader } } },
    )

    // Client avec la service role key (pour lire answer et écrire)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    )

    // Récupérer l'utilisateur connecté
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 2. Lire le body ──
    const { enigma_id, answer, hint_used } = await req.json()

    if (!enigma_id || !answer) {
      return new Response(JSON.stringify({ error: 'Missing enigma_id or answer' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 3. Récupérer la bonne réponse + infos enigme (service role) ──
    const { data: enigma, error: enigmaError } = await supabaseAdmin
      .from('enigmas')
      .select('id, escape_id, day_number, answer, xp_reward')
      .eq('id', enigma_id)
      .single()

    if (enigmaError || !enigma) {
      return new Response(JSON.stringify({ error: 'Enigma not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 4. Normalisation des réponses ──
    function normalize(str) {
      return str.trim().toUpperCase().replace(/\s+/g, ' ')
    }

    const correct = normalize(answer) === normalize(enigma.answer)

    // ── 5. Mauvaise réponse → on retourne juste false ──
    if (!correct) {
      return new Response(JSON.stringify({ correct: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 6. Bonne réponse — vérifier si déjà résolue ──
    const { data: existingAttempt } = await supabaseAdmin
      .from('user_enigma_attempts')
      .select('id')
      .eq('user_id', user.id)
      .eq('enigma_id', enigma_id)
      .maybeSingle()

    if (existingAttempt) {
      // Déjà résolue — on retourne correct sans re-créditer les XP
      return new Response(JSON.stringify({ correct: true, already_solved: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── 7. Calcul XP ──
    const xpEarned = hint_used ? Math.max(0, enigma.xp_reward - 50) : enigma.xp_reward

    const unlockedNextAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // ── 8. INSERT user_enigma_attempts ──
    await supabaseAdmin.from('user_enigma_attempts').insert({
      user_id: user.id,
      enigma_id: enigma_id,
      solved_at: new Date().toISOString(),
      hint_used: hint_used ?? false,
      xp_earned: xpEarned,
      unlocked_next_at: unlockedNextAt,
    })

    // ── 9. Récupérer l'escape pour savoir si c'est le dernier jour ──
    const { data: escape } = await supabaseAdmin
      .from('escapes')
      .select('duration_days')
      .eq('id', enigma.escape_id)
      .single()

    const isLastDay = enigma.day_number >= escape?.duration_days

    // ── 10. UPDATE user_escapes ──
    await supabaseAdmin
      .from('user_escapes')
      .update({
        current_day: isLastDay ? enigma.day_number : enigma.day_number + 1,
        last_played_at: new Date().toISOString(),
        completed_at: isLastDay ? new Date().toISOString() : null,
      })
      .eq('user_id', user.id)
      .eq('escape_id', enigma.escape_id)

    // ── 11. Incrémenter XP + niveau ──
    await supabaseAdmin.rpc('increment_xp', {
      p_user_id: user.id,
      p_xp: xpEarned,
    })

    // ── 12. Retourner le succès (sans la réponse correcte) ──
    return new Response(
      JSON.stringify({
        correct: true,
        xp_earned: xpEarned,
        unlocked_next_at: unlockedNextAt,
        is_last_day: isLastDay,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('[check-answer] Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
