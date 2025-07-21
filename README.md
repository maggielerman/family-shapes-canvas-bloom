# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/6e4109b6-b165-4556-baab-bd21469c6dee

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6e4109b6-b165-4556-baab-bd21469c6dee) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- XYFlow (for interactive family tree visualization)
- Supabase (for database and authentication)

## Features

### Interactive Family Tree Builder
The application now includes an interactive family tree builder powered by XYFlow that allows users to:

- **Drag and Drop**: Reposition family members by dragging nodes around the canvas
- **Visual Connections**: See relationships between family members with color-coded connection lines
- **Real-time Updates**: Add new family members and connections with immediate visual feedback
- **Multiple Layouts**: Choose from different visualization layouts including:
  - Interactive XYFlow builder (default)
  - Traditional tree layout
  - Radial layout
  - Force-directed layout
  - D3 tree layout
  - Cluster layout

### Database Integration
- Uses Supabase for data persistence
- Supports complex family relationships (parent, child, sibling, partner, donor, etc.)
- Handles family tree memberships and connections
- Secure authentication and authorization

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6e4109b6-b165-4556-baab-bd21469c6dee) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
