import axios from 'axios';
import * as mockData from '../data/mockData';

const API_BASE = 'http://localhost:8000/api';
const apiClient = axios.create({ baseURL: API_BASE, timeout: 3000 });

export const api = {
  getEvents: async (filters = {}) => {
    try {
      const res = await apiClient.get('/events', { params: filters });
      const data = Array.isArray(res.data) ? res.data : (res.data?.events || []);
      if (data && data.length > 0) return data;
    } catch (e) {
      console.warn("Backend API offline or unreachable, using seeded demo dataset.");
    }
    return mockData.mockEvents;
  },

  getThreats: async () => {
    try {
      const res = await apiClient.get('/threats');
      if (res.data) return res.data;
    } catch (e) {
      console.warn("Backend threat API offline, using fallback dataset.");
    }
    return {
      bySeverity: mockData.getThreatsBySeverity(),
      byType: mockData.getThreatsByType(),
      topIPs: mockData.getTopAttackingIPs(),
      timeline: mockData.getTimelineData()
    };
  },

  getAttackChains: async () => {
    try {
      const res = await apiClient.get('/attack-chains');
      if (res.data && res.data.chains && res.data.chains.length > 0) return res.data;
    } catch (e) {
      console.warn("Backend attack-chains API offline, using fallback dataset.");
    }
    return { chains: mockData.mockAttackChains };
  },

  getMLPerformance: async () => {
    try {
      const res = await apiClient.get('/ml/performance');
      if (res.data && res.data.models) return res.data;
    } catch (e) {
      console.warn("Backend ML API offline, using fallback dataset.");
    }
    return mockData.mockMLPerformance;
  },

  getRiskScores: async () => {
    try {
      const res = await apiClient.get('/risk-scores');
      if (res.data) return res.data;
    } catch (e) {
      console.warn("Backend risk-scores API offline, using fallback dataset.");
    }
    return { scores: mockData.mockEvents.filter(e => e.risk_score > 30) };
  },

  getRecommendations: async () => {
    try {
      const res = await apiClient.get('/recommendations');
      if (res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.recommendations || []);
        if (list.length > 0) return { recommendations: list };
      }
    } catch (e) {
      console.warn("Backend recommendations API offline, using fallback dataset.");
    }
    return { recommendations: mockData.mockRecommendations };
  },

  getComplianceViolations: async () => {
    try {
      const res = await apiClient.get('/compliance/violations');
      const summaryRes = await apiClient.get('/compliance/summary');
      if (res.data) {
        return {
          violations: Array.isArray(res.data) ? res.data : (res.data?.violations || []),
          summary: summaryRes.data || {}
        };
      }
    } catch (e) {
      console.warn("Backend compliance API offline, using fallback dataset.");
    }
    return { violations: mockData.mockComplianceViolations, summary: mockData.getComplianceSummary() };
  }
};
