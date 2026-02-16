# React Tailwind AK Kit

A production-ready CLI tool to scaffold modern React applications with Tailwind CSS, Vite, and best practices.

## Features

- ⚡ **Vite** - Superfast build tool
- 🎨 **Tailwind CSS** - Pre-configured with a modern theme
- 🛣️ **React Router** - Navigation ready
- 📡 **Axios** - API service setup
- 📂 **Clean Architecture** - Scalable folder structure
- ⚙️ **Interactive Setup** - Optional TypeScript, Redux, Auth, ShadCN logic

## Usage

Run the following command in your terminal:

```bash
npx react-tailwind-ak-kit my-app
```

Follow the interactive prompts to customize your project.

## Generated Project Structure

```
my-app/
 ├── src/
 │   ├── assets/
 │   ├── components/
 │   │   ├── ui/
 │   │   └── layout/
 │   ├── pages/
 │   ├── hooks/
 │   ├── services/
 │   ├── context/
 │   ├── routes/
 │   ├── utils/
 │   ├── App.jsx
 │   └── main.jsx
 ├── .env
 ├── tailwind.config.js
 └── package.json
```

## Local Development

1. Clone this repository
2. Run `npm install`
3. Run `npm link`
4. Run `react-tailwind-ak-kit test-app` in any directory to test

## Publishing to NPM

1. Update version in `package.json`
2. Run `npm login`
3. Run `npm publish --access public`

