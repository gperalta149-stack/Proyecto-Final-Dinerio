// frontend/src/features/home/data/homeData.tsx
import React from "react";
import {
  WalletCards,
  ChartColumn,
  Target,
  CalendarDays,
  FileSpreadsheet,
  PiggyBank,
} from "lucide-react";
import {
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaXTwitter,
} from "react-icons/fa6";

// ============================================
// NAVEGACIÓN
// ============================================
export const NAV_ITEMS = [
  { href: "#features", label: "Características" },
  { href: "#how-it-works", label: "Cómo Funciona" },
  { href: "#cta", label: "Comenzar" },
];

// ============================================
// REDES SOCIALES
// ============================================
export const SOCIAL_LINKS = [
  {
    label: "X",
    href: "https://x.com/",
    icon: <FaXTwitter size={20} className="icon-glow" />,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/",
    icon: <FaLinkedin size={20} className="icon-glow" />,
  },
  {
    label: "GitHub",
    href: "https://github.com/",
    icon: <FaGithub size={20} className="icon-glow" />,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/",
    icon: <FaInstagram size={20} className="icon-glow" />,
  },
];

// ============================================
// ESTADÍSTICAS
// ============================================
export const STATS = [
  { value: "+500", label: "Usuarios Confían" },
  { value: "$50K+", label: "En Suscripciones Gestionadas" },
  { value: "95%", label: "De Gastos Optimizados" },
];

// ============================================
// FEATURES - CON ICONOS CON BRILLO
// ============================================
export const FEATURES = [
  {
    icon: <WalletCards size={28} className="icon-glow" />,
    title: "Gestión Centralizada",
    description:
      "Agrega y organiza todas tus suscripciones en un solo dashboard intuitivo. Nunca más olvides una renovación.",
  },
  {
    icon: <ChartColumn size={28} className="icon-glow" />,
    title: "Análisis Detallado",
    description:
      "Visualiza tus gastos con gráficos interactivos. Identifica tendencias y oportunidades de ahorro al instante.",
  },
  {
    icon: <Target size={28} className="icon-glow" />,
    title: "Presupuestos Inteligentes",
    description:
      "Establece límites de gasto y recibe alertas cuando te acerques a ellos. Mantén el control total de tus finanzas.",
  },
  {
    icon: <CalendarDays size={28} className="icon-glow-cyan" />,
    title: "Calendario de Pagos",
    description:
      "Planifica y visualiza todos tus pagos futuros en un calendario interactivo. Prepárate para los vencimientos.",
  },
  {
    icon: <FileSpreadsheet size={28} className="icon-glow" />,
    title: "Reportes Automáticos",
    description:
      "Genera reportes detallados de tus gastos por categoría, período o servicio.",
  },
  {
    icon: <PiggyBank size={28} className="icon-glow-cyan" />,
    title: "Ahorro Garantizado",
    description:
      "Identifica suscripciones innecesarias y optimiza tus gastos mensuales.",
  },
];

// ============================================
// STEPS
// ============================================
export const STEPS = [
  {
    step: 1,
    title: "Regístrate Gratis",
    description: "Crea tu cuenta en menos de 2 minutos. No requiere tarjeta de crédito.",
  },
  {
    step: 2,
    title: "Agrega Tus Suscripciones",
    description: "Importa o agrega manualmente todas tus suscripciones recurrentes.",
  },
  {
    step: 3,
    title: "Optimiza y Ahorra",
    description: "Identifica gastos innecesarios y toma el control de tus finanzas.",
  },
];

// ============================================
// FOOTER
// ============================================
export const FOOTER_COLUMNS = [
  {
    heading: "Producto",
    links: [
      { label: "Características", href: "#features" },
      { label: "Cómo Funciona", href: "#how-it-works" },
      { label: "Comenzar Gratis", href: "/register" },
    ],
  },
  {
    heading: "Soporte",
    links: [
      { label: "Centro de Ayuda", href: "#" },
      { label: "Contacto", href: "#" },
      { label: "Privacidad", href: "#" },
      { label: "Términos", href: "#" },
    ],
  },
];