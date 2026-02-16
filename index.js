#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';
import chalk from 'chalk';
import execa from 'execa';
import figlet from 'figlet';
import gradient from 'gradient-string';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

async function init() {
  console.log(gradient.pastel.multiline(figlet.textSync('React Tailwind AK Kit', { horizontalLayout: 'full' })));
  console.log(chalk.blue('Welcome to the Ultimate React + Tailwind CLI Generator! 🚀\n'));

  program
    .name('react-tailwind-ak-kit')
    .description('CLI to scaffold production-ready React apps')
    .version('1.0.0')
    .argument('<project-name>', 'Name of the project')
    .action(async (projectName) => {
      try {
        const targetDir = path.resolve(process.cwd(), projectName);

        if (fs.existsSync(targetDir)) {
          console.error(chalk.red(`\nError: Directory "${projectName}" already exists.`));
          process.exit(1);
        }

        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'typescript',
            message: 'Do you want to use TypeScript?',
            default: false,
          },
          {
            type: 'confirm',
            name: 'redux',
            message: 'Do you want Redux Toolkit configured?',
            default: false,
          },
          {
            type: 'confirm',
            name: 'auth',
            message: 'Do you want an Authentication starter (Context + Dummy Pages)?',
            default: false,
          },
          {
            type: 'confirm',
            name: 'shadcn',
            message: 'Do you want to include ShadCN UI utils (clsx, tailwind-merge)?',
            default: false,
          },
        ]);

        await generateProject(projectName, targetDir, answers);

      } catch (error) {
        console.error(chalk.red('\nAn error occurred:', error));
        process.exit(1);
      }
    });

  program.parse(process.argv);
}

async function generateProject(projectName, targetDir, options) {
  const spinner = ora('Initializing project...').start();
  
  try {
    // 1. Create Vite App
    spinner.stop();
    console.log(chalk.blue('Creating Vite app...'));
    const template = options.typescript ? 'react-ts' : 'react';
    // Use npm create instead of npx to avoid "cb.apply is not a function" errors
    await execa('npm', ['create', 'vite@latest', projectName, '--', '--template', template], { stdio: 'inherit' });
    
    // 2. Install Dependencies
    console.log(chalk.blue('Installing core dependencies...'));
    process.chdir(targetDir);
    
    const dependencies = [
      'axios', 
      'react-router-dom', 
      'clsx', 
      'tailwind-merge',
      'lucide-react'
    ];
    
    const devDependencies = [
      'tailwindcss@^3.4.17', 
      'postcss', 
      'autoprefixer',
      'prettier',
      'eslint-config-prettier',
      'eslint-plugin-prettier'
    ];

    if (options.redux) {
      dependencies.push('@reduxjs/toolkit', 'react-redux');
    }
    await execa('npm', ['install', ...dependencies], { stdio: 'inherit' });
    await execa('npm', ['install', '-D', ...devDependencies], { stdio: 'inherit' });

    // 3. Initialize Tailwind
    console.log(chalk.blue('Initializing Tailwind CSS...')); 
    // await execa('npx', ['tailwindcss', 'init', '-p'], { stdio: 'inherit' }); // Removed due to v4 bin issue/redundancy

    // 4. Setup Folder Structure
    console.log(chalk.blue('Setting up architecture...'));
    await setupFolderStructure(targetDir, options);

    // 5. Create Configuration Files
    console.log(chalk.blue('Creating configuration files...'));
    await createConfigFiles(targetDir, options);

    console.log(chalk.green(`\nSuccessfully created project: ${projectName}`));
    
    console.log('\nTo get started:\n');
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan('  npm run dev\n'));

  } catch (err) {
    if (spinner.isSpinning) spinner.fail(chalk.red('Failed to generate project.'));
    console.error(chalk.red(err));
    process.exit(1);
  }
}

async function setupFolderStructure(targetDir, options) {
  const srcDir = path.join(targetDir, 'src');
  
  // Clean default src
  await fs.emptyDir(srcDir);

  const folders = [
    'assets',
    'components/ui',
    'components/layout',
    'pages',
    'hooks',
    'services',
    'context',
    'routes',
    'utils',
    'store' // Optional, but good to have if Redux
  ];

  for (const folder of folders) {
    await fs.ensureDir(path.join(srcDir, folder));
  }
}

async function createConfigFiles(targetDir, options) {
  const srcDir = path.join(targetDir, 'src');
  const ext = options.typescript ? 'tsx' : 'jsx';
  const jsExt = options.typescript ? 'ts' : 'js';

  // 1. Tailwind Config
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#f8fafc',
        surface: '#ffffff',
      }
    },
  },
  plugins: [],
}
`;
  await fs.writeFile(path.join(targetDir, 'tailwind.config.js'), tailwindConfig);

  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
  await fs.writeFile(path.join(targetDir, 'postcss.config.js'), postcssConfig);

  // 2. index.css
  const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background text-slate-900 antialiased;
  }
}
`;
  await fs.writeFile(path.join(srcDir, 'index.css'), indexCss);

  // 3. Utils (cn)
  const utilsContent = `import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
`;
  await fs.writeFile(path.join(srcDir, `utils/cn.${jsExt}`), utilsContent);

  // 4. Components - Layout (Navbar)
  const navbarContent = `import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const Navbar = () => {
  return (
    <nav className="bg-surface shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary">Brand</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-primary text-sm font-medium">
                Home
              </Link>
              <Link to="/about" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                About
              </Link>
            </div>
          </div>
          <div className="flex items-center">
             <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                Action
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
`;
  await fs.writeFile(path.join(srcDir, `components/layout/Navbar.${ext}`), navbarContent);

  // 5. Pages - Home
  const homeContent = `import React from 'react';
import { cn } from '../utils/cn';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block xl:inline">Ready to build</span>{' '}
          <span className="block text-primary xl:inline">Something Amazing?</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          This is a production-ready template pre-configured with Tailwind CSS, React Router, Axios, and best practices.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
              Get started
            </a>
          </div>
          <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
              Learn more
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
`;
  await fs.writeFile(path.join(srcDir, `pages/Home.${ext}`), homeContent);

  // 6. Config - Routes
  const routesContent = `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Home from '../pages/Home';

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<div className="p-8 text-center">About Page</div>} />
        <Route path="*" element={<div className="p-8 text-center">404 Not Found</div>} />
      </Routes>
    </>
  );
};

export default AppRoutes;
`;
  await fs.writeFile(path.join(srcDir, `routes/AppRoutes.${ext}`), routesContent);

  // 7. Config - App & Main
  const appContent = `import React from 'react';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <AppRoutes />
    </div>
  );
}

export default App;
`;
  await fs.writeFile(path.join(srcDir, `App.${ext}`), appContent);

  const mainContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
${options.redux ? "import { Provider } from 'react-redux';\nimport { store } from './store/store';" : ''}
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    ${options.redux ? '<Provider store={store}>' : ''}
    <BrowserRouter>
      <App />
    </BrowserRouter>
    ${options.redux ? '</Provider>' : ''}
  </React.StrictMode>,
);
`;
  await fs.writeFile(path.join(srcDir, `main.${ext}`), mainContent);

  // 8. Service - Axios
  const axiosContent = `import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth token here
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = \`Bearer \${token}\`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here
    return Promise.reject(error);
  }
);

export default api;
`;
  await fs.writeFile(path.join(srcDir, `services/api.${jsExt}`), axiosContent);

  // 9. Redux (if selected)
  if (options.redux) {
      const storeContent = `import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // counter: counterReducer,
  },
});
`;
    await fs.writeFile(path.join(srcDir, `store/store.${jsExt}`), storeContent);
  }
}

// Run the initialization
init();
