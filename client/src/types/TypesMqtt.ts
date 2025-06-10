// DASHBOARD TOPICS
export type TopicDashboard = {
  value: string;
  timestamp?: string;
};

export type TopicAmbient = {
  value: string | number | boolean;
  min: string;
  max: string;
  status: "normal" | "warning" | "critical" | "inactive";
  unit?: string;
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
  timestamp: string;
  history:
    | [
        {
          date: string;
          hora: string;
          valor: string;
        }
      ]
    | [];
};

// CONTROL TOPICS
export type TopicControl = {
  sensor: string;
  status: boolean;
};
