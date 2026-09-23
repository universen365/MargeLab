# OTP inscription — réglages Supabase (MargeLab)

## 1. Confirmation email activée

**Authentication → Providers → Email**

- Email activé
- **Confirm email** = ON

## 2. Template du mail (pour reconnaître MargeLab)

**Authentication → Emails → Templates → Confirm sign up**

### Subject (objet)

```text
MargeLab — ton code de confirmation
```

### Body (corps) — colle ceci

```html
<h2>Bienvenue sur MargeLab</h2>
<p>Voici ton code à 6 chiffres pour confirmer ton compte :</p>
<p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">{{ .Token }}</p>
<p>Ce code expire bientôt. Si tu n’as pas demandé de compte MargeLab, ignore ce mail.</p>
```

Important : utilise **`{{ .Token }}`** (le code), **pas** seulement le lien `{{ .ConfirmationURL }}`.

Puis **Save**.

> Si tu ne peux pas modifier le template (Free + email intégré) : branche un **SMTP custom** (Resend) dans **Authentication → SMTP Settings**, puis réessaie. Avec SMTP custom, tu peux customiser librement.

## 3. URLs (toujours utiles)

**Authentication → URL Configuration**

- **Site URL** : `https://TON-PROJET.vercel.app`
- **Redirect URLs** : `https://TON-PROJET.vercel.app/**` et `http://localhost:5173/**`

## 4. Expéditeur (reconnaître le mail)

Idéal avec Resend / SMTP :

- From name : `MargeLab`
- From email : ex. `noreply@tondomaine.com` (domaine vérifié chez Resend)

Sans SMTP custom, l’expéditeur reste générique Supabase → plus souvent en spam, moins reconnaissable.

## 5. Limites

Avec email intégré Supabase : ~**2 mails/heure** projet.  
Avec SMTP custom : plafond beaucoup plus haut (réglable dans **Rate Limits**).

## Parcours app

1. Créer un compte  
2. Écran « Code de confirmation »  
3. Saisie du code à 6 chiffres → message vert → connexion
