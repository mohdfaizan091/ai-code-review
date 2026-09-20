const variants = { primary: 'button-primary', secondary: 'button-secondary', ghost: 'button-ghost', danger: 'button-danger' };
const Button = ({ variant = 'primary', className = '', type = 'button', children, ...props }) => (
  <button type={type} className={`button ${variants[variant]} ${className}`} {...props}>{children}</button>
);
export default Button;
