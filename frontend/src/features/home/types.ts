// frontend/src/features/home/types.ts
import React from "react";

export interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface StepItem {
  step: number;
  title: string;
  description: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface NavItem {
  href: string;
  label: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export interface FeatureCardProps {
  feature: FeatureItem;
  index?: number;
}

export interface StepCardProps {
  step: StepItem;
  index?: number;
}

export interface StatCardProps {
  stat: StatItem;
  delay?: number;
}

export interface SocialIconProps {
  icon: React.ReactNode;
  href: string;
  label: string;
  className?: string;
}

export interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  className?: string;
}