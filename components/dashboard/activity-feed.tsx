import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Zap, CheckCircle, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'material' | 'summary' | 'quiz' | 'flashcard' | 'chat';
  title: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const iconMap = {
  material: BookOpen,
  summary: Zap,
  quiz: CheckCircle,
  flashcard: BookOpen,
  chat: MessageSquare,
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No activities yet. Start by uploading a study material!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = iconMap[activity.type];
              return (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
