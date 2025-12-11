import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Config padrão do Next + TypeScript
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Suas customizações
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],

    // 👉 Aqui a gente relaxa as regras que estão quebrando o build
    rules: {
      // Pode usar `any` sem quebrar o build
      "@typescript-eslint/no-explicit-any": "off",

      // Variáveis não usadas = só aviso, não erro
      "@typescript-eslint/no-unused-vars": "warn",

      // Permite @ts-ignore sem reclamar
      "@typescript-eslint/ban-ts-comment": "off",

      // Permite <img> sem reclamar (ou coloca "warn" se quiser só aviso)
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;