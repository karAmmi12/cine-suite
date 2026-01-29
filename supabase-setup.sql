-- 📊 Tables pour tracking sécurité

-- Table : telemetry_events
CREATE TABLE telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event VARCHAR(100) NOT NULL,
  device_id VARCHAR(64),
  session_id VARCHAR(64),
  properties JSONB,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour telemetry_events
CREATE INDEX idx_telemetry_device_id ON telemetry_events(device_id);
CREATE INDEX idx_telemetry_event ON telemetry_events(event);
CREATE INDEX idx_telemetry_created_at ON telemetry_events(created_at DESC);

-- Table : security_alerts
CREATE TABLE security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event VARCHAR(100) NOT NULL,
  reason TEXT,
  device_id VARCHAR(64),
  severity VARCHAR(20) DEFAULT 'medium',
  data JSONB,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- Index pour security_alerts
CREATE INDEX idx_alerts_device_id ON security_alerts(device_id);
CREATE INDEX idx_alerts_severity ON security_alerts(severity);
CREATE INDEX idx_alerts_created_at ON security_alerts(created_at DESC);
CREATE INDEX idx_alerts_resolved ON security_alerts(resolved);

-- Vue : suspicious_devices (appareils suspects)
CREATE VIEW suspicious_devices AS
SELECT 
  device_id,
  COUNT(*) as alert_count,
  MAX(created_at) as last_alert,
  ARRAY_AGG(DISTINCT event) as alert_types
FROM security_alerts
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY device_id
HAVING COUNT(*) > 5
ORDER BY alert_count DESC;

-- Vue : daily_stats (stats quotidiennes)
CREATE VIEW daily_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_events,
  COUNT(DISTINCT device_id) as unique_devices,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(CASE WHEN event LIKE '%suspicious%' THEN 1 END) as suspicious_events
FROM telemetry_events
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Fonction : detect_suspicious_pattern (détection automatique)
CREATE OR REPLACE FUNCTION detect_suspicious_pattern()
RETURNS TRIGGER AS $$
BEGIN
  -- Si même device_id avec >10 events en 1 minute
  IF (
    SELECT COUNT(*) 
    FROM telemetry_events 
    WHERE device_id = NEW.device_id 
    AND created_at > NOW() - INTERVAL '1 minute'
  ) > 10 THEN
    INSERT INTO security_alerts (event, reason, device_id, severity, data)
    VALUES (
      'rate_limit_exceeded',
      'More than 10 events in 1 minute',
      NEW.device_id,
      'high',
      jsonb_build_object('event_count', 10, 'timeframe', '1 minute')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger : auto-detect suspicious
CREATE TRIGGER trigger_detect_suspicious
AFTER INSERT ON telemetry_events
FOR EACH ROW
EXECUTE FUNCTION detect_suspicious_pattern();

-- Row Level Security (RLS) pour admin only
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

-- Policy : Admin peut tout voir
CREATE POLICY "Admin can view all telemetry"
ON telemetry_events FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can view all alerts"
ON security_alerts FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

-- Policy : Service role peut insérer (backend)
CREATE POLICY "Service can insert telemetry"
ON telemetry_events FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service can insert alerts"
ON security_alerts FOR INSERT
TO service_role
WITH CHECK (true);
