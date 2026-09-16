# 🎨 Pause Palette

Welcome to **Pause Palette**! This is a full-stack [Next.js](https://nextjs.org) application powered by [Prisma](https://www.prisma.io) and [NextAuth](https://next-auth.js.org/).

---

## 🚀 Quick Start

Get the project up and running locally in just a few steps.

### 1️⃣ Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed, then run:
```bash
npm install
```

### 2️⃣ Configure Environment
Create a `.env` file in the root folder. You'll need to define your environment variables here (like database URL and auth secrets). *(See `.env.example` if available).*

### 3️⃣ Start the Database
This project uses a local **Prisma Postgres** database. 
Open a **new terminal** and run this command. **Leave this terminal open and running**:
```bash
npx prisma dev
```

### 4️⃣ Sync the Database Schema
Open a **second terminal** and push the Prisma schema to your newly running local database:
```bash
npx prisma db push
```

### 5️⃣ Run the Application
In that same terminal, start the Next.js development server (which handles both the frontend and backend API):
```bash
npm run dev
```
🎉 **All done!** Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Learn More

If you want to dive deeper into the tools we are using:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma ORM Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
