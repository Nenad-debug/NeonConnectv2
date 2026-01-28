const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { newPassword } = JSON.parse(event.body);
  const authHeader = event.headers.authorization;

  if (!authHeader || !newPassword) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing authorization or password' }) };
  }

  // Validacija lozinke
  if (newPassword.length < 6) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Lozinka mora imati najmanje 6 karaktera' }) };
  }

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    // Korisnik je već verifikovan putem email linka (reset-password URL sa tokenom)
    // Supabase je automatski postavio session, tako da možemo direktno updateUser
    const token = authHeader.replace('Bearer ', '');
    
    // Prvo dobij korisnika da bi znali njegov ID
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    // Updateuj lozinku
    const { error: updateError } = await supabase.auth.updateUser(
      { password: newPassword }
    );

    if (updateError) {
      // Ako je greška "Password should be different from old password" ili slično
      if (updateError.message && updateError.message.includes('different')) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Nova lozinka mora biti drugačita od stare lozinke' }) };
      }
      return { statusCode: 400, body: JSON.stringify({ error: updateError.message }) };
    }

    // Označi reset kao korišćen
    const { error: markError } = await supabase
      .from('users')
      .update({ 
        password_reset_used: true, 
        password_reset_at: new Date().toISOString() 
      })
      .eq('id', user.id);

    if (markError) {
      // Lozinka je promenjena, ali marking failed — to je OK, poruka je važnija
      console.warn('Failed to mark password reset:', markError);
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (e) {
    console.error('Password change error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error during password change' }) };
  }
};
