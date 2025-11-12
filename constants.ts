import { Role, TaskStatus, User, Task, Event, Meeting, NewsItem } from './types';

// In a real app, you'd never store plain text passwords.
// This is a simple hash simulation.
const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};

export const INITIAL_USERS: User[] = [
  { id: 'admin-1', username: 'admin', passwordHash: simpleHash('adminpass'), role: Role.ADMIN },
  { id: 'admin-2', username: 'super.admin', passwordHash: simpleHash('superadminpass'), role: Role.ADMIN },
  { id: 'member-1', username: 'john.doe', passwordHash: simpleHash('memberpass'), role: Role.MEMBER },
  { id: 'member-2', username: 'jane.smith', passwordHash: simpleHash('memberpass2'), role: Role.MEMBER },
  { id: 'member-3', username: 'peter.jones', passwordHash: simpleHash('peterpass'), role: Role.MEMBER },
  { id: 'member-4', username: 'susan.williams', passwordHash: simpleHash('susanpass'), role: Role.MEMBER },
];

export const INITIAL_TASKS: Task[] = [
  { 
    id: 'task-1', 
    title: 'Organize Welcome BBQ', 
    description: 'Plan and organize the welcome BBQ for new members. Book venue, arrange catering.',
    assignedTo: 'member-1',
    status: TaskStatus.ONGOING,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  { 
    id: 'task-2', 
    title: 'Update Social Media', 
    description: 'Post weekly updates on all social media channels.',
    assignedTo: 'member-2',
    status: TaskStatus.NOT_STARTED,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  { 
    id: 'task-3',
    title: 'Design Club T-Shirts',
    description: 'Create a new design for the annual club t-shirts.',
    assignedTo: 'member-3',
    status: TaskStatus.NOT_STARTED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'task-4',
    title: 'Collect Member Feedback',
    description: 'Create and distribute a survey to collect feedback from all members.',
    assignedTo: 'member-4',
    status: TaskStatus.ONGOING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
];

export const INITIAL_EVENTS: Event[] = [
  { 
    id: 'event-1', 
    name: 'Annual Club Gala', 
    description: 'The most anticipated event of the year. Dress to impress!',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    attendees: ['member-1', 'member-3']
  },
  {
    id: 'event-2',
    name: 'Past Workshop on Public Speaking',
    description: 'A workshop to improve public speaking skills.',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    attendees: ['member-1', 'member-2', 'member-4']
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
    {
        id: 'meeting-1',
        topic: 'Q3 Planning Session',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Discussion points: budget allocation, upcoming events, member feedback.'
    }
];

export const INITIAL_NEWS: NewsItem[] = [
    {
        id: 'news-1',
        title: 'Welcome New Members!',
        content: 'A big welcome to all our new members who joined this month. We are excited to have you!',
        createdAt: new Date().toISOString()
    },
    {
        id: 'news-2',
        title: 'Recap of the Annual Charity Run',
        content: 'Thanks to everyone who participated, we raised over $5000 for a great cause. Attendance was at an all-time high!',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
];