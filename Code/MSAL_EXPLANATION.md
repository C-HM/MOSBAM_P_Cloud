# Comprendre l'Authentification MSAL

**MSAL (Microsoft Authentication Library)** est une bibliothèque qui permet aux applications d'authentifier des utilisateurs via **Microsoft Entra ID** (anciennement Azure Active Directory). Elle gère la complexité des protocoles de sécurité modernes comme **OAuth 2.0** et **OpenID Connect**.

## Pourquoi utiliser MSAL ?

Au lieu de gérer vous-même les mots de passe et la sécurité (ce qui est risqué), vous déléguez cette tâche à Microsoft. L'application reçoit simplement une "preuve" (un jeton) que l'utilisateur est bien qui il prétend être.

## Flux d'Authentification (Schema)

Voici comment cela fonctionne "sous le capot" lorsque vous vous connectez :

```mermaid
sequenceDiagram
    participant User as Utilisateur
    participant App as Application (Node.js)
    participant Azure as Microsoft Identity (Azure AD)

    User->>App: Clique sur "Se connecter avec Microsoft"
    App->>Azure: Redirige vers la page de connexion Microsoft<br/>(Envoi Client ID + Scopes)

    Note over User, Azure: L'utilisateur saisit son email/mot de passe<br/>sur la page sécurisée de Microsoft

    Azure->>User: Demande le consentement (si nécessaire)
    User->>Azure: Accepte

    Azure->>App: Renvoie un "Code d'autorisation" (via URL de redirection)

    Note over App: L'application reçoit le code

    App->>Azure: Échange le Code contre un Token (Accès + ID)
    Azure-->>App: Renvoie les Tokens (Access Token, ID Token)

    App->>App: Valide le Token et crée une session utilisateur
    App-->>User: Affiche la page d'accueil (Connecté)
```

## Concepts Clés

1.  **Client ID (Application ID)** : L'identifiant unique de votre application dans Azure.
2.  **Tenant ID (Directory ID)** : L'identifiant de votre organisation (ou "Common" pour tous les comptes Microsoft).
3.  **Client Secret** : Un mot de passe secret que seule votre application connaît pour prouver son identité à Azure.
4.  **Redirect URI** : L'URL où Azure renvoie l'utilisateur après la connexion (par ex: `http://localhost:3003/auth/redirect`).
