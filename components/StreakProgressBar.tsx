import React from 'react';

interface StreakProps {
  currentStreak: number;
}

const StreakProgressBar: React.FC<StreakProps> = ({ currentStreak }) => {

  const TARGET = 7;
  
 
  const percentage = Math.min((currentStreak / TARGET) * 100, 100);
  

  const isCompleted = currentStreak >= TARGET;

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold' }}>Current Streak</span>
        <span style={{ color: isCompleted ? '#10B981' : '#6366F1' }}>
          {currentStreak} / {TARGET} Days
        </span>
      </div>

      {/* Bar Background */}
      <div style={{ 
        height: '24px', 
        width: '100%', 
        backgroundColor: '#E5E7EB', 
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {/* Fill bar*/}
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: isCompleted ? '#10B981' : '#6366F1',
          transition: 'width 0.5s ease-in-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {percentage > 10 && (
            <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>

      <p style={{ marginTop: '10px', fontSize: '14px', color: '#6B7280', textAlign: 'center' }}>
        {isCompleted 
          ? "🎉 Congratulations! You've received an NFT!" 
          : "Check in for 7 consecutive days to automatically receive an NFT!"}
      </p>
    </div>
  );
};

export default StreakProgressBar;