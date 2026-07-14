import { ORGANIZATIONS, USERS, TICKETS } from './mock-data';
import type { Organization, User, Ticket } from '@/types';

function wait(ms: number = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const api = {
  async getOrganizations(): Promise<Organization[]> {
    await wait(500);
    return [...ORGANIZATIONS];
  },

  async getUsers(): Promise<User[]> {
    await wait(400);
    return [...USERS];
  },

  async getTickets(): Promise<Ticket[]> {
    await wait(500);
    return [...TICKETS];
  },

  async getTicketById(id: string): Promise<Ticket | undefined> {
    await wait(300);
    return TICKETS.find((t) => t.id === id);
  },
};
