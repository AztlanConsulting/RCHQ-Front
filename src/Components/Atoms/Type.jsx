import React from "react";
import { cx } from "@/utils/cx";

const variantStyles = {
  /** Main page heading (e.g. "Gestión de Empleados") */
  "page-title": "text-2xl font-semibold tracking-tight text-black sm:text-3xl",
  /** Same scale as page title — employee name, etc. */
  "display-name": "text-xl font-semibold tracking-tight text-black sm:text-3xl",
  /** Role, secondary line — gray, bold */
  subtitle: "text-sm font-semibold text-slate-500 sm:text-base",
  /** Small caps-style labels (metrics, form labels) — gray, bold */
  "metric-label": "text-xs font-semibold text-slate-500 sm:text-sm",
  /** Emphasized values under labels — black, regular weight, larger */
  "metric-value": "text-base font-normal text-black sm:text-xl",
  /** Card / section titles */
  "section-title": "text-lg font-semibold text-black sm:text-xl",
  /** Default paragraph */
  body: "text-base font-normal text-black",
};

const sizeModifiers = {
  sm: "text-sm sm:text-sm",
  md: "",
  lg: "text-lg sm:text-xl",
  xl: "text-xl sm:text-2xl",
};

const weightMap = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const colorMap = {
  black: "text-black",
  slate: "text-slate-600",
  muted: "text-slate-500",
  brand: "text-slate-900",
};

/**
 * @param {object} props
 * @param {'page-title'|'display-name'|'subtitle'|'metric-label'|'metric-value'|'section-title'|'body'} [props.variant='body']
 * @param {keyof typeof sizeModifiers} [props.size]
 * @param {keyof typeof weightMap} [props.weight]
 * @param {keyof typeof colorMap} [props.color]
 * @param {string} [props.className]
 * @param {keyof JSX.IntrinsicElements} [props.as]
 */
const Type = ({
  variant = "body",
  size,
  weight,
  color,
  className = "",
  as: Component = "span",
  children,
  ...rest
}) => {
  const base = variantStyles[variant] ?? variantStyles.body;
  const sizeExtra = size ? sizeModifiers[size] : "";
  const w = weight ? weightMap[weight] : "";
  const c = color ? colorMap[color] : "";

  return (
    <Component className={cx(base, sizeExtra, w, c, className)} {...rest}>
      {children}
    </Component>
  );
};

export default Type;
