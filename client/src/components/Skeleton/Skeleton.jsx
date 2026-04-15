/**
 * ============================================
 * SalonFlow — Skeleton Loading Components
 * ============================================
 * Shimmer placeholder components for premium
 * loading states across all pages.
 */

import './Skeleton.css';

export const SkeletonPulse = ({ width, height, borderRadius = '8px', style = {} }) => (
  <div
    className="skeleton-pulse"
    style={{ width, height, borderRadius, ...style }}
  />
);

export const SkeletonText = ({ lines = 3, widths = [] }) => (
  <div className="skeleton-text-group">
    {[...Array(lines)].map((_, i) => (
      <div
        key={i}
        className="skeleton-pulse skeleton-text-line"
        style={{ width: widths[i] || (i === lines - 1 ? '60%' : '100%') }}
      />
    ))}
  </div>
);

export const SkeletonStatCard = () => (
  <div className="skeleton-stat-card">
    <SkeletonPulse width="52px" height="52px" borderRadius="12px" />
    <div className="skeleton-stat-info">
      <SkeletonPulse width="60px" height="28px" borderRadius="6px" />
      <SkeletonPulse width="100px" height="14px" borderRadius="4px" style={{ marginTop: 6 }} />
    </div>
  </div>
);

export const SkeletonCard = ({ height = '200px' }) => (
  <div className="skeleton-card">
    <SkeletonPulse width="100%" height={height} borderRadius="12px" />
  </div>
);

export const SkeletonServiceCard = () => (
  <div className="skeleton-service-card">
    <SkeletonPulse width="100%" height="180px" borderRadius="12px 12px 0 0" />
    <div className="skeleton-service-body">
      <SkeletonPulse width="40px" height="40px" borderRadius="10px" />
      <SkeletonPulse width="70%" height="18px" borderRadius="4px" style={{ marginTop: 12 }} />
      <SkeletonPulse width="90%" height="14px" borderRadius="4px" style={{ marginTop: 8 }} />
      <SkeletonPulse width="50%" height="14px" borderRadius="4px" style={{ marginTop: 6 }} />
    </div>
  </div>
);

export const SkeletonTableRow = ({ cols = 5 }) => (
  <tr className="skeleton-table-row">
    {[...Array(cols)].map((_, i) => (
      <td key={i}>
        <SkeletonPulse
          width={i === 0 ? '120px' : `${50 + Math.random() * 50}px`}
          height="16px"
          borderRadius="4px"
        />
      </td>
    ))}
  </tr>
);

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="skeleton-table-wrap">
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {[...Array(cols)].map((_, i) => (
              <th key={i}><SkeletonPulse width="80px" height="12px" borderRadius="4px" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="skeleton-chart">
    <SkeletonPulse width="140px" height="20px" borderRadius="6px" />
    <SkeletonPulse width="100%" height="240px" borderRadius="12px" style={{ marginTop: 16 }} />
  </div>
);

export const SkeletonBookingCard = () => (
  <div className="skeleton-booking-card">
    <div className="skeleton-booking-header">
      <SkeletonPulse width="80px" height="24px" borderRadius="50px" />
      <SkeletonPulse width="120px" height="16px" borderRadius="4px" />
    </div>
    <div className="skeleton-booking-body">
      <SkeletonPulse width="140px" height="16px" borderRadius="4px" />
      <SkeletonPulse width="110px" height="16px" borderRadius="4px" style={{ marginTop: 8 }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <SkeletonPulse width="80px" height="26px" borderRadius="50px" />
        <SkeletonPulse width="80px" height="26px" borderRadius="50px" />
      </div>
    </div>
    <div className="skeleton-booking-footer">
      <SkeletonPulse width="60px" height="20px" borderRadius="4px" />
      <SkeletonPulse width="80px" height="32px" borderRadius="50px" />
    </div>
  </div>
);

export const SkeletonDashboard = () => (
  <div className="skeleton-dashboard">
    <div className="skeleton-welcome">
      <SkeletonPulse width="280px" height="32px" borderRadius="8px" />
      <SkeletonPulse width="200px" height="16px" borderRadius="4px" style={{ marginTop: 8 }} />
    </div>
    <div className="skeleton-stats-row">
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard />
    </div>
    <div className="skeleton-charts-row">
      <SkeletonChart />
      <SkeletonChart />
    </div>
  </div>
);
