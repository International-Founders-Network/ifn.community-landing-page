# IFN Community

International Founders Network (IFN) is a global ecosystem for founders to connect, grow, and succeed.

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Netlify Functions (Serverless)
- **Database**: Neon (Postgres)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 🛠️ Project Structure

```bash
├── db/              # Database migrations and schema
├── netlify/
│   └── functions/   # Backend API endpoints
├── src/
│   ├── components/  # Reusable UI components
│   ├── hooks/       # Custom React hooks
│   └── pages/       # Page components
└── netlify.toml     # Netlify configuration and API routing
```

## 💻 Local Development

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file in the root:

   ```bash
   NETLIFY_DATABASE_URL="your-neon-dev-connection-string"
   ```

3. **Run Development Server**:
   To test both frontend and backend (Netlify Functions), run:

   ```bash
   npx netlify dev
   ```

## 🌐 Deployment

The project is configured for deployment on **Netlify**.

- Push to the main branch to trigger a deploy.
- Ensure `NETLIFY_DATABASE_URL` is set in the Netlify Dashboard.

## 🗄️ Database & Migrations

- Schema changes are tracked in `db/migrations/`.
- For more details, see [db/README.md](./db/README.md).
