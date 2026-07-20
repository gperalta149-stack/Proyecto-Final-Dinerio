import api from "../../../shared/services/api";

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

interface AuditResponse {
  audit_logs: AuditLog[];
}

export const auditService = {
  getRecent: async (limit = 10): Promise<AuditLog[]> => {
    const res = await api.get<AuditResponse>(`/audit?limit=${limit}`);
    return res.data.audit_logs;
  },
};
