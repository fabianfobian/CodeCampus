import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserSkill } from "@shared/schema";
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register required Chart.js components
Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type SkillWithTag = UserSkill & {
  tag: {
    id: number;
    name: string;
    description?: string;
  };
};

type SkillChartProps = {
  skills: SkillWithTag[];
};

export default function SkillChart({ skills }: SkillChartProps) {
  // Extract skill data for chart
  const labels = skills.map(skill => skill.tag.name);
  const dataValues = skills.map(skill => skill.proficiency);
  
  // Color scheme
  const primaryColor = 'rgb(59, 130, 246)';
  const primaryColorTransparent = 'rgba(59, 130, 246, 0.2)';
  
  // Prepare chart data
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Skill Level',
        data: dataValues,
        backgroundColor: primaryColorTransparent,
        borderColor: primaryColor,
        borderWidth: 2,
        pointBackgroundColor: primaryColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: primaryColor,
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: '#64748b',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#334155',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            return `Proficiency: ${context.raw}%`;
          }
        }
      }
    },
  };

  // Sort skills by proficiency for the badge list
  const sortedSkills = [...skills].sort((a, b) => b.proficiency - a.proficiency);
  
  // Skill level classification
  const getSkillClass = (proficiency: number) => {
    if (proficiency >= 80) return 'bg-primary-100 text-primary-700';
    if (proficiency >= 60) return 'bg-slate-100 text-slate-700';
    return '';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800">Your Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center h-64">
          {skills.length === 0 ? (
            <div className="flex items-center justify-center flex-col text-center">
              <div className="text-slate-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-slate-600">Start solving problems to build your skill profile</p>
              <p className="text-xs text-slate-400 mt-1">Your skills will be tracked as you solve problems across different topics</p>
            </div>
          ) : (
            <Radar data={chartData} options={chartOptions} />
          )}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {sortedSkills.map(skill => (
            <Badge 
              key={skill.tag.id} 
              variant="secondary"
              className={getSkillClass(skill.proficiency)}
            >
              {skill.tag.name} ({skill.proficiency}%)
            </Badge>
          ))}
          {skills.length === 0 && (
            <p className="text-sm text-slate-500">Solve problems to earn skill badges</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
