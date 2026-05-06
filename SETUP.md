# Deployment Checklist & Setup Guide

This document serves as the authoritative deployment checklist for the ITR Filing Management Platform. The architecture consists of a Django monolith on the backend and a React/Vite SPA on the frontend, supported by Supabase for PostgreSQL, Auth, and Storage.

## 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com/).
2. Obtain the **Project URL** and **anon key** (for the frontend) and the **service_role key** (for the backend).
3. **Database Preparation**:
   - The Django application manages the schema. No manual SQL is required for the application tables.
   - Run `python manage.py migrate` during the backend deployment.
4. **Authentication Setup**:
   - Go to Authentication > Providers.
   - Enable **Email** (disable email confirmations for ease of testing, or keep enabled for production).
   - Enable **Google** (Optional, requires OAuth client credentials).
5. **Storage Setup**:
   - Create a bucket named `documents` (or whatever you configure in `django-storages` if migrating from local `MEDIA_ROOT`).
   - Configure bucket policies to allow authenticated users to read/write.

## 2. Environment Variables

### Backend `.env`
Create a `.env` file in `backend/`:
```env
SECRET_KEY=your_django_secret_key
DEBUG=False
ALLOWED_HOSTS=.yourdomain.com,.onrender.com

# Database (Supabase PostgreSQL Connection Pool URL)
DATABASE_URL=postgresql://postgres:password@db.supabase.co:6543/postgres

# Supabase Auth Integration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key

# Email Notifications (Resend)
RESEND_API_KEY=re_your_resend_api_key

# Encryption Vault Key (CRITICAL: Must be exactly 32 bytes/characters for AES-256)
VAULT_KEY=super_secret_32_byte_vault_key_!!
```

### Frontend `.env`
Create a `.env` file in `frontend/`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://your-django-app.onrender.com
```

## 3. Backend Deployment (Render)
1. Connect your GitHub repository to Render and create a new **Web Service**.
2. **Build Command**: 
   ```bash
   pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
   ```
3. **Start Command**:
   ```bash
   gunicorn core.wsgi:application
   ```
4. **Environment Variables**: Add all the variables from the Backend `.env` section to the Render dashboard.

## 4. Frontend Deployment (Cloudflare Pages)
1. Connect your GitHub repository to Cloudflare Pages.
2. **Framework Preset**: Create React App / Vite
3. **Build Command**: `npm run build`
4. **Build output directory**: `dist`
5. **Environment Variables**: Add all the variables from the Frontend `.env` section.

## 5. First-Time Initialization
Once both the backend and frontend are live:
1. Register the very first account on the frontend.
2. Access the Django admin panel (`https://your-django-app.onrender.com/admin/`) (you will need to create a superuser via the Render shell first: `python manage.py createsuperuser`).
3. In the Django admin panel, change the newly registered user's role from `client` to `owner`.
4. The Owner can now log in to the frontend, create Staff accounts, configure Service Plans, and view the Audit Log.
