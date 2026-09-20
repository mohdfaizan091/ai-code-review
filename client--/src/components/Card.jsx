const Card = ({ className = '', children, ...props }) => <section className={`card ${className}`} {...props}>{children}</section>;
export default Card;
