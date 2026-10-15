# Deployment

The site is static HTML, CSS, and JavaScript, so it deploys to GitHub Pages without a server or build step. To exercise the runtime fetches before deploying, serve it locally as described in [quick_start.md](./quick_start.md).

## Deploy script

```bash
./deploy.sh
```

`deploy.sh` prints the current branch and the changed files, asks for confirmation, prompts for a commit message (default: "Update"), stages all changes, commits, pushes the checked-out branch to GitHub, and prints the site URL.

## Manual deployment

```bash
git add .
git commit -m "Update homepage content"
git push origin console
```

The deployed branch is `console`, which is also the default in the Pages settings below.

## GitHub Pages settings

In the repository, under Settings → Pages:

* Source: Deploy from a branch.
* Branch: `console`, folder `/ (root)`.
* Save. GitHub rebuilds the site within a minute or two.

The published site is https://connglli.github.io/.

## Troubleshooting

* 404 on a content page: the `content:` paths in [console.config.yaml](../console.config.yaml) resolve from the site root; check the path against the deployed file.
* The whole page reloads when a command runs: the input reached normal form submission instead of the hash route (`#/command`).
* Stale content after a deploy: hard refresh (Cmd+Shift+R or Ctrl+Shift+R); GitHub Pages can lag the push by a minute or two.
