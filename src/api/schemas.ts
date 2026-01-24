import { apiClient } from './client';
import type { MockSchema, MockSchemaDetail } from './types';

export const schemasApi = {
  getByProject: async (
    orgSlug: string,
    projectSlug: string,
  ): Promise<MockSchema[]> => {
    const response = await apiClient.get<MockSchema[]>(
      `/${orgSlug}/${projectSlug}/schemas`,
    );
    return response.data;
  },

  getBySlug: async (
    orgSlug: string,
    projectSlug: string,
    schemaSlug: string,
  ): Promise<MockSchemaDetail> => {
    const response = await apiClient.get<MockSchemaDetail>(
      `/${orgSlug}/${projectSlug}/${schemaSlug}`
    );
    return response.data;
  },

  create: async (
    orgSlug: string,
    projectSlug: string,
    data: {
    name: string;
    schemaJson: Record<string, any>;
  }): Promise<MockSchema> => {
    const response = await apiClient.post<MockSchema>(
      `/${orgSlug}/${projectSlug}/schemas`, data);
    return response.data;
  },

  update: async (
    orgSlug: string,
    projectSlug: string,
    schemaSlug: string,
    data: {
      name: string;
      schemaJson: Record<string, any>;
    },
  ): Promise<MockSchema> => {
    const res = await apiClient.put(
      `/${orgSlug}/${projectSlug}/${schemaSlug}`,
      data,
    );
    return res.data;
  },

  delete: async (
    orgSlug: string,
    projectSlug: string,
    schemaSlug: string,
  ): Promise<void> => {
    await apiClient.delete(
      `/${orgSlug}/${projectSlug}/${schemaSlug}`,
    );
  },
};
