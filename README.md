# iFreelancer Web Application

A modern freelancing platform built with Next.js, TypeScript, and Prisma.

## Features

- User Authentication
- Job Posting and Management
- Advanced Job Search with Filters
- Job Application System
- Real-time Email Notifications
- Responsive Design

## Tech Stack

- Next.js 14
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- TailwindCSS
- NextAuth.js
- React Query
- Resend Email Service

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/yourusername/ifreelancer-webapp.git
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Copy `.env.example` to `.env` and fill in your values.

4. Run database migrations

```bash
npx prisma migrate dev
```

5. Start the development server

```bash
npm run dev
```

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL database URL
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: Your application URL
- `RESEND_API_KEY`: API key for email service

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
