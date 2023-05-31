import React from 'react';
import styles from '../styles/loading-dots.module.css';

const LoadingDots = (props) => {
  const { color = '#000', style = 'small' } = props;

  return (
    <span className={style === 'small' ? styles.loading2 : styles.loading}>
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
    </span>
  );
};

LoadingDots.defaultProps = {
  color: '#000',
  style: 'small',
};

export default LoadingDots;
