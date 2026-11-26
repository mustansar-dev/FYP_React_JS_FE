import { Link } from 'react-router-dom';

export function Container({ as: Tag = 'div', className = '', ...props }) {
  return <Tag className={`container ${className}`.trim()} {...props} />;
}

export function Card({ as: Tag = 'div', className = '', ...props }) {
  return <Tag className={`card ${className}`.trim()} {...props} />;
}

export function Button({ as: Tag = 'button', variant = 'primary', className = '', children, ...props }) {
  const classes = `button button-${variant} ${className}`.trim();
  if (Tag === Link) return <Link className={classes} {...props}>{children}</Link>;
  if (Tag === 'a') return <a className={classes} {...props}>{children}</a>;
  return <Tag className={classes} {...props}>{children}</Tag>;
}

export function Field({ label, id, hint, error, ...props }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field ${error ? 'field-invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy} {...props} />
      {hint && <small id={`${id}-hint`}>{hint}</small>}
      {error && <small className="field-error" id={`${id}-error`}>{error}</small>}
    </div>
  );
}
