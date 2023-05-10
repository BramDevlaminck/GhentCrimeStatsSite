# ghent-crime-site


## Project Setup

```sh
npm install
```

### Pull the required data from the portal

```sh
./pull_data_from_portal.sh
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Deploy to site
Run this script to generate the static site that expects to be located at the `VITE_BASE_URL`
specified in the `.env.production` file.

```sh
npm run build
```
