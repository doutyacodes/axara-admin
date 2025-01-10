import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Clock, Repeat, BarChart, Share2 } from 'lucide-react';
import LoadingSpinner from '@/app/_components/LoadingSpinner';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/analytics');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* Your existing spinner component would go here */}
        <div><LoadingSpinner/> </div>
      </div>
    );
  }

  // Using placeholder data since we're not making real API calls
  const analyticsData = data || {
    totalVisits: 15234,
    uniqueVisitors: 8456,
    avgSessionDuration: '4m 32s',
    returningVisitors: 3891
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Website Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <BarChart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalVisits.toLocaleString()}</div>
            <p className="text-xs text-gray-500">All-time website visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Distinct users tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgSessionDuration}</div>
            <p className="text-xs text-gray-500">Time spent per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returning Visitors</CardTitle>
            <Repeat className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.returningVisitors.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Repeat visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share2 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalShares.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Article shares across platform</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;