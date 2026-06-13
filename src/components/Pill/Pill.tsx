import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Pill.module.css';

type PillVariant = 'default' | 'primary' | 'ghost';
type PillSize = 'md' | 'small' | 'big';

interface PillBaseProps {
  variant?: PillVariant;
  size?: PillSize;
  className?: string;
  children: ReactNode;
}

/** Build the className string shared by every rendered element. */
function pillClass({
  variant = 'default',
  size = 'md',
  className,
}: Pick<PillBaseProps, 'variant' | 'size' | 'className'>): string {
  return [
    styles.pill,
    variant === 'primary' ? styles.primary : '',
    variant === 'ghost' ? styles.ghost : '',
    size === 'small' ? styles.small : '',
    size === 'big' ? styles.big : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

type PillButtonProps = PillBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined;
    href?: undefined;
  };

type PillLinkProps = PillBaseProps & {
  /** Internal route — renders a react-router <Link>. */
  to: string;
  'aria-label'?: string;
};

type PillAnchorProps = PillBaseProps & {
  /** External / hash href — renders a plain <a>. */
  href: string;
  'aria-label'?: string;
};

export type PillProps = PillButtonProps | PillLinkProps | PillAnchorProps;

/**
 * The shared pill control. Renders a <Link>, <a>, or <button> depending on
 * which navigation prop is supplied, so callers get the right semantics for
 * free while sharing one set of styles.
 */
export function Pill(props: PillProps) {
  const { variant, size, className, children } = props;
  const classes = pillClass({ variant, size, className });

  if ('to' in props && props.to !== undefined) {
    const { to, ...rest } = props;
    return (
      <Link className={classes} to={to} aria-label={rest['aria-label']}>
        {children}
      </Link>
    );
  }

  if ('href' in props && props.href !== undefined) {
    const { href, ...rest } = props;
    return (
      <a className={classes} href={href} aria-label={rest['aria-label']}>
        {children}
      </a>
    );
  }

  const {
    variant: _v,
    size: _s,
    className: _c,
    children: _ch,
    ...buttonProps
  } = props as PillButtonProps;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
