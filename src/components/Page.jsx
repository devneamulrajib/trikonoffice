import { motion } from 'framer-motion';

const Page = ({ children, title, subtitle, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
  >
    <div className="page-header" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 32
    }}>
      <div>
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: 'var(--zinc-900)',
          letterSpacing: '-0.02em'
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 16, color: 'var(--zinc-500)', marginTop: 4 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
    {children}
  </motion.div>
);

export default Page;