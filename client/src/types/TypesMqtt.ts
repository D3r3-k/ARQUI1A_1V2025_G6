// DASHBOARD TOPICS
export type TopicDashboard = {
  value: string;
  timestamp?: string;
};

export type TopicAmbient = {
  status: "normal" | "warning" | "critical" | "inactive";
  value: string | number | boolean;
  min: string;
  max: string;
  timestamp: string;
};

export type TopicActivity = {
  status: "on" | "off" | "alert" | "configured";
  sensor: string;
  message: string;
  timestamp?: string;
};

// HISTORY TOPICS
export type TopicHistory = {
  date_updated: string;
  sensor: string;
  history:
    | [
        {
          date: string;
          hour: string;
          value: string;
        }
      ]
    | [];
};

// CONTROL TOPICS
export type TopicControl = {
  sensor: string;
  status: boolean;
};
