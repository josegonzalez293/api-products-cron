# API Products Cron

NestJS service that syncs products from Contentful API to MongoDB through an hourly cron job and exposes JWT-protected endpoints for product queries and reporting.

## Prerequisites
- Node.js 22.x (use `nvm` to align versions if possible).
- MongoDB 7.x (local instance or managed service).
- Contentful account with access to the target Space/Environment and a Content Delivery API token.
- Docker & Docker Compose.

## Installation
1. Clone the repository and move into the project root.
2. Install dependencies: `npm install`.
3. Create a `.env` file in the root directory (see required variables below).

### Environment variables
| Variable | Description | Required | Default |
| --- | --- | --- | --- |
| `PORT` | HTTP port for the API | No | `3000` |
| `MONGODB_URI` | MongoDB connection string | Yes | — |
| `CONTENTFUL_URL` | Base Contentful host (e.g. `https://cdn.contentful.com`) | Yes | — |
| `CONTENTFUL_SPACE_ID` | Contentful Space ID | Yes | - |
| `CONTENTFUL_ENVIRONMENT` | Environment ID | Yes | — |
| `CONTENTFUL_CONTENT_TYPE` | Content type to sync | Yes | — |
| `CONTENTFUL_ACCESS_TOKEN` | Content Delivery token | Yes | — |
| `API_USERNAME` | Basic login username | No | `admin` |
| `API_PASSWORD` | Basic login password | No | `password` |
| `JWT_SECRET` | Secret used to sign/verify JWTs | Yes | — |
| `JWT_EXPIRES_IN` | Token expiration time (seconds) | No | `3600` |
| `PAGE_LIMIT` | Page size for listings | No | `5` |

Sample `.env`:
```
PORT=3000
MONGODB_URI=mongodb://products-mongo:27017/products
CONTENTFUL_URL=https://cdn.contentful.com
CONTENTFUL_SPACE_ID=your_space
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_CONTENT_TYPE=product
CONTENTFUL_ACCESS_TOKEN=your_token
API_USERNAME=admin
API_PASSWORD=superSecret
JWT_SECRET=change_me
JWT_EXPIRES_IN=3600
PAGE_LIMIT=5
```

## Local run
1. Make sure MongoDB is up (e.g. `docker-compose up mongo -d`).
2. Start the API with watch mode: `npm run start:dev`.
3. The API will be available at `http://localhost:3000` and Swagger at `http://localhost:3000/api/docs`.
4. The cron runs every hour (`0 * * * *`) and also triggers once on module init.

### Build / Production
```
npm run build
npm run start:prod
```

## Docker Compose
1. Create the `.env` file (it is loaded inside the container).
2. Run `npm run build`.
3. Run `docker-compose up --build`.
4. The `api` service exposes port `3000` and depends on the `mongo` container.

## Handy scripts
- `npm run start` : start NestJS without watch mode.
- `npm run start:dev` : development server (watch).
- `npm run lint` : run ESLint + Prettier.
- `npm run test` : execute unit tests.
- `npm run test:cov` : generate coverage under `coverage/`.


## API access
1. Authenticate via `POST /auth/login` using `API_USERNAME` and `API_PASSWORD`.
2. Use the returned Bearer token to call the Products and Reports endpoints.
3. Explore and try endpoints through Swagger UI (`/api/docs`), which includes the Bearer token input.
4. Postman collection is on the repository files