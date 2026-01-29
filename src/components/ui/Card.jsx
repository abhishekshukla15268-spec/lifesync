/**
 * Reusable Card component
 */
export const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
        {children}
    </div>
);

export default Card;
