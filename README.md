This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, configure your backend API base URL:

- Create a `.env.local` file in the project root and set your backend API port:

  ```
  NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
  ```

- For production deployments, use a `.env.production` file with the appropriate backend URL:

  ```
  NEXT_PUBLIC_API_BASE_URL=https://your-production-backend.com
  ```

Next, install dependencies:

If you don't have `pnpm` installed, install it globally:

```bash
npm install -g pnpm
```

Then install project dependencies:

```bash
pnpm i
```

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3030](http://localhost:3030) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
