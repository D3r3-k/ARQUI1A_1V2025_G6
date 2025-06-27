// DASHBOARD TOPICS
export type TopicDashboard = {
  value: string;
};

export type TopicAmbient = {
  value: string | number | boolean;
  min: string;
  max: string;
  status: "normal" | "warning" | "critical" | "inactive";
  unit: string;
  timestamp: string;
};

export type TopicActivity = {
  status: "on" | "off" | "alert" | "configured";
  sensor: string;
  message: string;
  timestamp?: string;
};

// HISTORY TOPICS
export type HistoryItem = {
  timestamp: string;
  value: string;
};

export type TopicHistoryStack = {
  history: HistoryItem[];
};

// CONTROL TOPICS
export type TopicModoControl = {
  modo: boolean;
};
export type TopicControl = {
  actuador: string;
  action: boolean;
};

// ALERT TOPIC
export type TopicAlert = {
  temperature: {
    status: boolean;
    msg: string;
  };
  humidity: boolean;
  light: boolean;
  air_quality: boolean;
  presence: boolean;
};

export type CalculationResults = {
  moda?: number;
  media?: number;
  mediana?: number;
  minimo?: number;
  maximo?: number;
  desviacion?: number;
  varianza?: number;
  suavizado?: number;
  movil?: number;
};
