/**
 * Reusable Badge component
 */
export const Badge = ({ children, color }) => (
    <span
        className="px-2 py-1 rounded-md text-xs font-semibold"
        style={{ backgroundColor: `${color}20`, color: color }}
    >
        {children}
    </span>
);

export default Badge;
