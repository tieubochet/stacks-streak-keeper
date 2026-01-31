import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';

interface ActivityHeatmapProps {
  checkIns: string[]; 
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ checkIns }) => {
  const today = new Date();
  
  const getValues = () => {
    const counts: { [key: string]: number } = {};
    checkIns.forEach(date => {
      counts[date] = (counts[date] || 0) + 1;
    });

    return Object.keys(counts).map(date => ({
      date: date,
      count: counts[date],
    }));
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Activity Log</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-sm bg-slate-800"></div>
            <div className="h-3 w-3 rounded-sm bg-orange-200"></div>
            <div className="h-3 w-3 rounded-sm bg-orange-500"></div>
            <div className="h-3 w-3 rounded-sm bg-red-600"></div>
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px]"> 
            <CalendarHeatmap
                startDate={new Date(today.getFullYear(), today.getMonth() - 11, 1)}
                endDate={today}
                values={getValues()}
                classForValue={(value) => {
                    if (!value) return 'color-empty';
                    if (value.count >= 4) return 'color-scale-5';
                    if (value.count >= 3) return 'color-scale-4';
                    if (value.count >= 2) return 'color-scale-3';
                    if (value.count >= 1) return 'color-scale-2';
                    return 'color-scale-1';
                }}
                tooltipDataAttrs={(value: any) => {
                    if (!value || !value.date) return null;
                    return {
                        'data-tooltip-id': 'heatmap-tooltip',
                        'data-tooltip-content': `${value.date}: ${value.count ? 'Checked in' : 'No activity'}`,
                    };
                }}
                showWeekdayLabels={true}
            />
            <Tooltip id="heatmap-tooltip" style={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "8px" }} />
        </div>
      </div>
    </div>
  );
};