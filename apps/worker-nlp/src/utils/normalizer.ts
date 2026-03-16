import { KNOWN_SKILLS } from '../constants';

export const SKILL_ALIASES: Record<string, string> = {
  // JavaScript
  js: 'javascript',
  javascript: 'javascript',
  ecmascript: 'javascript',
  es6: 'javascript',
  es2015: 'javascript',

  // TypeScript
  ts: 'typescript',
  typescript: 'typescript',

  // React
  react: 'react',
  reactjs: 'react',
  'react.js': 'react',
  'react js': 'react',

  // Node.js
  'node.js': 'node.js',
  node: 'node.js',
  nodejs: 'node.js',
  'node js': 'node.js',

  // Express
  express: 'express',
  expressjs: 'express',
  'express.js': 'express',

  // NestJS
  nestjs: 'nestjs',
  'nest.js': 'nestjs',
  'nest js': 'nestjs',

  // Python
  python: 'python',
  python3: 'python',
  py: 'python',

  // Java
  java: 'java',

  // C++
  'c++': 'c++',
  cpp: 'c++',
  cplusplus: 'c++',

  // C#
  'c#': 'c#',
  csharp: 'c#',
  'c sharp': 'c#',

  // Go
  go: 'go',
  golang: 'go',

  // Rust
  rust: 'rust',
  'rust-lang': 'rust',

  // Ruby
  ruby: 'ruby',
  'ruby on rails': 'ruby',
  rails: 'ruby',

  // SQL
  sql: 'sql',

  // MySQL
  mysql: 'mysql',

  // PostgreSQL
  postgresql: 'postgresql',
  postgres: 'postgresql',
  psql: 'postgresql',
  pg: 'postgresql',

  // MongoDB
  mongodb: 'mongodb',
  mongo: 'mongodb',
  'mongo db': 'mongodb',

  // Redis
  redis: 'redis',

  // Docker
  docker: 'docker',

  // Kubernetes
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',
  kube: 'kubernetes',

  // AWS
  aws: 'aws',
  'amazon web services': 'aws',

  // Azure
  azure: 'azure',
  'microsoft azure': 'azure',

  // GCP
  gcp: 'gcp',
  'google cloud': 'gcp',
  'google cloud platform': 'gcp',

  // Git
  git: 'git',
  github: 'git',
  gitlab: 'git',

  // CI/CD
  'ci/cd': 'ci/cd',
  cicd: 'ci/cd',
  'ci cd': 'ci/cd',
  'continuous integration': 'ci/cd',
  'continuous delivery': 'ci/cd',

  // HTML
  html: 'html',
  html5: 'html',

  // CSS
  css: 'css',
  css3: 'css',

  // Swift
  swift: 'swift',

  // SwiftUI
  swiftui: 'swiftui',
  'swift ui': 'swiftui',

  // Flutter
  flutter: 'flutter',

  // Dart
  dart: 'dart',

  // FileMaker
  filemaker: 'filemaker',
  'filemaker pro': 'filemaker',
};

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const extractAndNormalizeSkills = (text: string): string[] => {
  const found = new Set<string>();

  for (const [variant, canonical] of Object.entries(SKILL_ALIASES)) {
    const regex = new RegExp(`\\b${escapeRegex(variant)}\\b`, 'i');
    if (regex.test(text)) {
      found.add(canonical);
    }
  }

  for (const skill of KNOWN_SKILLS) {
    const regex = new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i');
    if (regex.test(text)) {
      found.add(skill);
    }
  }

  return Array.from(found).sort();
};
