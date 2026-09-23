# Auth identifiant / mot de passe

- **Connexion** : identifiant + mot de passe  
- **Créer un compte** : identifiant + mot de passe + confirmation  

Pas d’email visible. (Supabase utilise en interne `identifiant@margelab.app`.)

## Supabase obligatoire

**Authentication → Providers → Email** → **Confirm email = OFF**

Sinon l’inscription crée le compte sans session et l’utilisateur ne peut pas entrer.
