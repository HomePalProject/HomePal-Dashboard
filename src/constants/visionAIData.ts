import type { VisionLogsData } from '@typeDefs/visionAITypes';

export const fallbackVisionLogsData: VisionLogsData = {
  logs: [
    {
      id: '1',
      flyerUrl:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150',
      supermarket: 'Whole Foods Market',
      date: 'Oct 24, 09:12 AM',
      errorCode: 'LOW_CONFIDENCE_OCR',
      status: 'ACTION_REQUIRED',
    },
    {
      id: '2',
      flyerUrl:
        'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&q=80&w=150',
      supermarket: "Trader Joe's",
      date: 'Oct 23, 14:45 PM',
      errorCode: 'JSON_SCHEMA_MISMATCH',
      status: 'IN_REVIEW',
    },
    {
      id: '3',
      flyerUrl:
        'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=150',
      supermarket: 'Safeway',
      date: 'Oct 22, 11:20 AM',
      errorCode: 'MISSING_PRICE_TAGS',
      status: 'RESOLVED',
    },
    {
      id: '4',
      flyerUrl:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150',
      supermarket: 'Kroger',
      date: 'Oct 21, 08:30 AM',
      errorCode: 'LOW_CONFIDENCE_OCR',
      status: 'ACTION_REQUIRED',
    },
    {
      id: '5',
      flyerUrl:
        'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&q=80&w=150',
      supermarket: 'Target',
      date: 'Oct 20, 16:15 PM',
      errorCode: 'JSON_SCHEMA_MISMATCH',
      status: 'ACTION_REQUIRED',
    },
    {
      id: '6',
      flyerUrl:
        'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=150',
      supermarket: 'Walmart',
      date: 'Oct 19, 10:00 AM',
      errorCode: 'MISSING_PRICE_TAGS',
      status: 'IN_REVIEW',
    },
    {
      id: '7',
      flyerUrl:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150',
      supermarket: 'Whole Foods Market',
      date: 'Oct 18, 09:45 AM',
      errorCode: 'LOW_CONFIDENCE_OCR',
      status: 'RESOLVED',
    },
  ],
  insights: {
    lowConfidenceOcr: 45,
    schemaMismatch: 30,
    missingDataFields: 15,
  },
  resolvedThisWeek: 24,
};
