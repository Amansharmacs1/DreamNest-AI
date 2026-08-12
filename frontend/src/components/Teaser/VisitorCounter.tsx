import { useState, useEffect } from 'react';
import { getVisitorCount, incrementVisitorCount } from '@/services/visitorService';

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCount = async () => {
      try {
        const hasVisited = localStorage.getItem('hasVisitedNivasaAI');
        let currentCount: number;

        if (!hasVisited) {
          currentCount = await incrementVisitorCount();
          localStorage.setItem('hasVisitedNivasaAI', 'true');
        } else {
          currentCount = await getVisitorCount();
        }

        if (isMounted) {
          setCount(currentCount);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCount();

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return <div className="text-blue-700/60 text-xs font-medium">👀 Visitors</div>;
  }

  return (
    <div className="text-blue-700/60 text-xs font-medium" title="Total visits to NIVASA AI">
      👀 {loading || count === null ? '—' : count.toLocaleString()} visitors
    </div>
  );
}
