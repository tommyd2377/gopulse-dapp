# GoPulse dApp

GoPulse dApp is the Vue interface for creating, discovering, validating, and collecting rewards from GoPulse Protocol content validation markets on Solana.

## What GoPulse Is

GoPulse Protocol enables creators to post content, open a validation market around that content, and stake SOL into the initial pool. Validators can take long or short positions, the market closes when the validator threshold is reached, and eligible participants can collect rewards based on the validation outcome.

The dApp is the frontend for the on-chain protocol in [`gopulse-core`](https://github.com/tommyd2377/gopulse-core). It reads the Anchor IDL, connects through Solana wallet adapters, and calls the existing protocol instructions for posting, validation, collection, and profile management.

## Status

This project is a prototype/devnet dApp. It is production-presentable as an interface, but the protocol and application should be treated as experimental software until the program, accounts, economics, and security model have been reviewed for production use.

Live app: [https://www.gpdapp.xyz/#/](https://www.gpdapp.xyz/#/)

## Features

- Wallet connect through Solana Wallet Adapter and `solana-wallets-vue`
- Feed of live validation markets
- Create a post/content validation market
- Upload supported media through Bundlr/Arweave
- Search markets by topic
- Long/short validation positions
- Poster and validator collection flows
- Account/profile creation and update
- Hash-based routing for Feed, Markets, Accounts, Validated, Profile, and market detail pages

## Tech Stack

- Vue 3
- Vue Router with hash routing
- Tailwind CSS
- Solana Wallet Adapter / `solana-wallets-vue`
- Anchor / `@project-serum/anchor`
- Solana `web3.js`
- Bundlr / Arweave uploads
- Vue CLI

## Repository Structure

```text
gopulse-dapp/
  app/
    public/             Static assets and app shell HTML
    src/
      api/              Anchor and Solana API calls
      components/       Vue page and UI components
      composables/      Wallet, workspace, pagination, slug helpers
      idl/              GoPulse Anchor IDL
      models/           Client-side account models
      App.vue           Application shell
      main.js           Vue/router entrypoint
      main.css          Tailwind and GoPulse design system styles
    package.json        App scripts and dependencies
    vue.config.js       Vue CLI and webpack fallbacks
```

The protocol source lives separately in [`gopulse-core`](https://github.com/tommyd2377/gopulse-core), which contains the Anchor program, account definitions, and tests.

## Local Development

Install dependencies from the app directory:

```bash
cd app
npm install
```

Run the local development server:

```bash
npm run serve
```

Run against configured network modes:

```bash
npm run serve:devnet
npm run serve:mainnet
```

Build and lint:

```bash
npm run lint
npm run build
npm run build:devnet
npm run build:mainnet
```

## Environment And Config Notes

The app uses Vue environment modes and expects cluster configuration through existing Vue environment files such as `.env`, `.env.devnet`, and `.env.mainnet`. Do not commit private keys, wallet secrets, production credentials, billing settings, or live admin credentials.

The frontend reads the GoPulse program address from `src/idl/gopulse.json` and uses `VUE_APP_CLUSTER_URL` from the active environment mode.

## Relationship To `gopulse-core`

`gopulse-core` is the source of truth for protocol behavior. The dApp calls the existing Anchor instructions, including:

- `post_v0`
- `validate_v0`
- `poster_collect_v0`
- `validator_collect_v0`
- `signup_user_v0`
- `update_user_v0`

UI changes should not alter transaction signatures, account layouts, PDA seeds, or protocol semantics unless a coordinated protocol migration is explicitly planned.

## Deployment Notes

The app builds as a Vue CLI static app from the `app` directory. Deployments should build the intended mode, publish the generated static output, and preserve hash routing for URLs under `/#/`.

If the production host is connected to the GitHub repository, pushing to the configured deployment branch may be enough to trigger a new deployment. Otherwise, run the hosting provider's existing deployment process from the generated build output.

## Known Limitations

- Prototype/devnet status; not audited for production capital movement.
- Market economics and resolution behavior are defined by the current Anchor program.
- Uploads depend on Bundlr/Arweave availability and the connected wallet.
- Some profile metadata may be unavailable if a wallet has not created a GoPulse profile.
- The app should be tested with devnet funds and fake/test content before any production use.

## Security Disclaimer

This dApp interacts with Solana wallets and on-chain program instructions. Review transactions before signing. Use devnet/test funds for development. Do not use this prototype as financial, legal, or investment advice.

## License

License not specified.

## Links

- dApp repository: [https://github.com/tommyd2377/gopulse-dapp](https://github.com/tommyd2377/gopulse-dapp)
- Protocol repository: [https://github.com/tommyd2377/gopulse-core](https://github.com/tommyd2377/gopulse-core)
- Live app: [https://www.gpdapp.xyz/#/](https://www.gpdapp.xyz/#/)
- Author GitHub: [https://github.com/tommyd2377](https://github.com/tommyd2377)
