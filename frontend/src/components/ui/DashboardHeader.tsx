/**
 * DashboardHeader - Presentational component for dashboard header
 * Follows SRP: Only responsible for rendering header UI with date/time and quote
 */
import React from 'react'
import { Card, CardContent } from './card'
import type { DateTimeInfo } from '../../utils/dateTime'

interface DashboardHeaderProps {
  dateTime: DateTimeInfo
  quote: string
  userName?: string
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  dateTime,
  quote,
  userName = 'Artist'
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">
          Welcome back, {userName}!
        </h1>
        <p className="text-gray-100 mt-1 font-semibold drop-shadow-md">
          {dateTime.date} • {dateTime.time}
        </p>
      </div>

      {/* Quote of the Day */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">Quote of the Day</h3>
          <p className="text-purple-100 italic">
            "{quote.split(' - ')[0]}" - {quote.split(' - ')[1]}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
