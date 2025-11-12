
export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum TaskStatus {
  NOT_STARTED = 'Not Started',
  ONGOING = 'Ongoing',
  FINISHED = 'Finished',
}

export interface User {
  id: string;
  username: string;
  passwordHash: string; // In a real app, this would be a hash
  role: Role;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // userId
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  attendees: string[]; // array of userIds
}

export interface Meeting {
  id: string;
  topic: string;
  date: string;
  notes: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}