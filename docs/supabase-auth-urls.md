# Auth URLs (Supabase)

Page : **Authentication → URL Configuration**

## Site URL

Remplace `http://localhost:3000` par l’URL Vercel de l’app, par ex. :

```text
https://TON-PROJET.vercel.app
```

## Redirect URLs (Add URL)

Ajoute au minimum :

```text
https://TON-PROJET.vercel.app/**
http://localhost:5173/**
http://localhost:5173/login?confirmed=1
https://TON-PROJET.vercel.app/login?confirmed=1
```

Puis **Save changes**.

Le lien du mail de confirmation renvoie vers `/login?confirmed=1` avec un message vert de succès.
