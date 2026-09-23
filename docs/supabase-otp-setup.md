# Confirmation par lien email (MargeLab)

L’app utilise le **lien de confirmation** (pas d’OTP).

## Template Supabase

**Authentication → Emails → Templates → Confirm sign up**

**Objet :**
```text
MargeLab — confirme ton compte
```

**Corps (exemple) :**
```html
<h2>Bienvenue sur MargeLab</h2>
<p>Clique sur le bouton pour confirmer ton compte :</p>
<p><a href="{{ .ConfirmationURL }}">Confirmer mon compte</a></p>
<p>Si tu n’as pas demandé de compte MargeLab, ignore ce mail.</p>
```

Utilise `{{ .ConfirmationURL }}` (lien), pas le code OTP.

## URLs

**Authentication → URL Configuration**

- Site URL : `https://TON-PROJET.vercel.app`
- Redirect URLs :
  - `https://TON-PROJET.vercel.app/**`
  - `https://TON-PROJET.vercel.app/login?confirmed=1`
  - `http://localhost:5173/**`
  - `http://localhost:5173/login?confirmed=1`

## Important — mails

Sans SMTP custom, Supabase n’envoie qu’aux **membres de l’équipe** du projet.  
Pour les vrais utilisateurs → brancher Resend (ou autre SMTP).

Après le clic dans le mail → page Connexion + message vert de succès.
