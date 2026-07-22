import axios from 'axios';
import * as mockData from '../data/mockData';

const API_BASE = 'http://localhost:8000/api';
const USE_MOCK = false; // Toggle when backend is ready

const apiClient = axios.create({ baseURL: API_BASE, timeout: 5000 });

export const api = {
  getEvents: async (filters = {}) => {
    if (USE_MOCK) return mockData.mockEvents;
    const res = await apiClient.get('/events', { params: filters });
    return Array.isArray(res.data) ? res.data : (res.data?.events || []);
  },
  getThreats: async () => {
    if (USE_MOCK) return {
      bySeverity: mockData.getThreatsBySeverity(),
      byType: mockData.getThreatsByType(),
      topIPs: mockData.getTopAttackingIPs(),
      timeline: mockData.getTimelineData()
    };
    const res = await apiClient.get('/threats');
    return res.data;
  },
  getAttackChains: async () => {
    if (USE_MOCK) return { chains: mockData.mockAttackChains };
    const res = await apiClient.get('/attack-chains');
    return res.data;
  },
  getMLPerformance: async () => {
    if (USE_MOCK) return mockData.mockMLPerformance;
    const res = await apiClient.get('/ml/performance');
    return res.data;
  },
  getRiskScores: async () => {
    if (USE_MOCK) return { scores: mockData.mockEvents.filter(e => e.risk_score > 30) };
    const res = await apiClient.get('/risk-scores');
    return res.data;
  },
  getRecommendations: async () => {
    if (USE_MOCK) return { recommendations: mockData.mockRecommendations };
    const res = await apiClient.get('/recommendations');
    return res.data;
  },
  getComplianceViolations: async () => {
    if (USE_MOCK) return { violations: mockData.mockComplianceViolations, summary: mockData.getComplianceSummary() };
    const res = await apiClient.get('/compliance');
    return res.data;
  }
};
