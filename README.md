# University Procurement Management System

A comprehensive web-based procurement management system built with React, TypeScript, and Supabase. This system streamlines the procurement process for universities by managing purchase requests, approvals, suppliers, budgets, and user roles.

## 🌟 Features

- **User Management**: Role-based access control with departments and user roles
- **Purchase Requests**: Create, submit, and track purchase requests
- **Approval Workflow**: Multi-level approval system with budget controls
- **Supplier Management**: Manage suppliers, ratings, and catalogs
- **Budget Tracking**: Departmental budget allocation and monitoring
- **Dashboard Analytics**: Real-time insights and reporting
- **Dark/Light Theme**: Modern UI with theme switching
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: React Context API

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**
- **Supabase Account** (for database and authentication)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd internship_project_1910876
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Initialize Database Schema**:
   - Open the Supabase SQL Editor
   - Copy and paste the contents of `database_schema.sql`
   - Execute the script to create all tables, views, and sample data

3. **Verify Database Setup**:
   - Navigate to `/diagnostic` in the application
   - Check that all tables are created and sample data is loaded

### 5. Launch the Application

```bash
# Development server
npm run dev

# The application will be available at http://localhost:3000
```

## 🧪 Testing

### Manual Testing

1. **Database Connection Test**:
   - Navigate to `/diagnostic`
   - Verify all database tables are accessible
   - Check sample data is loaded

2. **User Authentication Flow**:
   - Test user registration at `/register`
   - Verify user roles and permissions

3. **Purchase Request Workflow**:
   - Create a new request at `/requests/new`
   - Test approval process at `/approvals`
   - Verify budget tracking

4. **Admin Functions**:
   - Test department creation at `/admin/departments/create`
   - Manage suppliers at `/suppliers`
   - Verify user management

### Automated Testing

Currently, the project doesn't have automated tests configured. To add testing:

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Add test scripts to package.json
```

## 🚀 Deployment

### Option 1: Vercel (Recommended)

1. **Prepare for Production**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push to master branch

### Option 2: Netlify

1. **Build Configuration**:
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**:
   - Connect repository to Netlify
   - Add environment variables
   - Deploy

### Option 3: Manual Deployment

1. **Build the Application**:
   ```bash
   npm run build
   ```

2. **Upload to Web Server**:
   - Upload the `dist` folder contents to your web server
   - Configure server to serve `index.html` for all routes
   - Ensure HTTPS is enabled for Supabase integration

### Environment Variables for Production

Ensure these are set in your production environment:

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React context providers
├── lib/               # Database and utility functions
├── pages/             # Page components
│   ├── Dashboard.tsx
│   ├── Requests.tsx
│   ├── AddRequest.tsx
│   ├── Approvals.tsx
│   ├── Admin.tsx
│   ├── Suppliers.tsx
│   └── ...
└── App.tsx            # Main application component
```

## 🔧 Configuration

### Supabase Configuration

The application uses Supabase for:
- **Database**: PostgreSQL with real-time subscriptions
- **Authentication**: User management and session handling
- **Storage**: File uploads (if needed)

### Database Schema

Key tables include:
- `users` - User accounts and profiles
- `departments` - Organizational units
- `roles` - User roles and permissions
- `purchase_requests` - Purchase request submissions
- `suppliers` - Vendor information
- `budgets` - Departmental budget allocations

## 🌐 Branch Information

This project currently has **2 branches**:

- **`master`** - Main production branch (current)
- **`origin/master`** - Remote master branch

The complete project is available in the master branch, which contains all features and functionality.

## 📝 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit
```

## 🔒 Security Considerations

- **Environment Variables**: Never commit `.env` files
- **API Keys**: Use Supabase RLS (Row Level Security) policies
- **Authentication**: Implement proper user session management
- **HTTPS**: Always use HTTPS in production

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify Supabase URL and anon key
   - Check network connectivity
   - Ensure database schema is properly initialized

2. **Build Errors**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npx tsc --noEmit`

3. **Environment Variables**:
   - Ensure `.env.local` file exists
   - Restart development server after changes

### Getting Help

- Check the Supabase documentation for database issues
- Review React and TypeScript documentation for frontend issues
- Use browser developer tools for debugging

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the documentation

---

**Note**: This is a university procurement management system designed for educational institutions. Ensure compliance with your institution's procurement policies and regulations.
