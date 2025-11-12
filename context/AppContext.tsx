import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User, Task, Event, Meeting, NewsItem, Role, TaskStatus } from '../types';
import { INITIAL_USERS, INITIAL_TASKS, INITIAL_EVENTS, INITIAL_MEETINGS, INITIAL_NEWS } from '../constants';

const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString();
};


interface AppContextType {
  // State
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  events: Event[];
  meetings: Meeting[];
  news: NewsItem[];

  // Auth
  login: (username: string, password_raw: string) => boolean;
  logout: () => void;
  
  // User Management (Admin)
  addUser: (username: string, password_raw: string) => void;
  deleteUser: (userId: string) => void;

  // Task Management
  addTask: (title: string, description: string, assignedTo: string, dueDate?: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;

  // Event Management
  addEvent: (name: string, description: string, date: string) => void;
  joinEvent: (eventId: string, userId: string) => void;

  // Meeting Management
  addMeeting: (topic: string, date: string, notes: string) => void;

  // News Management
  addNewsItem: (title: string, content: string) => void;

  // Profile Management
  updatePassword: (userId: string, newPassword_raw: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useLocalStorage<User[]>('club_users', INITIAL_USERS);
  const [tasks, setTasks] = useLocalStorage<Task[]>('club_tasks', INITIAL_TASKS);
  const [events, setEvents] = useLocalStorage<Event[]>('club_events', INITIAL_EVENTS);
  const [meetings, setMeetings] = useLocalStorage<Meeting[]>('club_meetings', INITIAL_MEETINGS);
  const [news, setNews] = useLocalStorage<NewsItem[]>('club_news', INITIAL_NEWS);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('club_current_user', null);

  const login = (username: string, password_raw: string): boolean => {
    const user = users.find(u => u.username === username);
    if (user && user.passwordHash === simpleHash(password_raw)) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };
  
  const addUser = (username: string, password_raw: string) => {
    const newUser: User = {
      id: `member-${Date.now()}`,
      username,
      passwordHash: simpleHash(password_raw),
      role: Role.MEMBER,
    };
    setUsers([...users, newUser]);
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    // Also unassign their tasks or reassign them. For simplicity, we'll just leave them.
  };

  const addTask = (title: string, description: string, assignedTo: string, dueDate?: string) => {
    const newTask: Task = {
        id: `task-${Date.now()}`,
        title,
        description,
        assignedTo,
        status: TaskStatus.NOT_STARTED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate,
    };
    setTasks([newTask, ...tasks]);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };
  
  const addEvent = (name: string, description: string, date: string) => {
    const newEvent: Event = {
      id: `event-${Date.now()}`,
      name,
      description,
      date,
      attendees: [],
    };
    setEvents([newEvent, ...events]);
  };

  const joinEvent = (eventId: string, userId: string) => {
    setEvents(events.map(e => {
      if (e.id === eventId) {
        if (!e.attendees.includes(userId)) {
          return { ...e, attendees: [...e.attendees, userId] };
        } else {
          // un-join
          return { ...e, attendees: e.attendees.filter(id => id !== userId) };
        }
      }
      return e;
    }));
  };
  
  const addMeeting = (topic: string, date: string, notes: string) => {
    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      topic,
      date,
      notes,
    };
    setMeetings([newMeeting, ...meetings]);
  };
  
  const addNewsItem = (title: string, content: string) => {
    const newNewsItem: NewsItem = {
      id: `news-${Date.now()}`,
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    setNews([newNewsItem, ...news]);
  };

  const updatePassword = (userId: string, newPassword_raw: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, passwordHash: simpleHash(newPassword_raw) } : u));
    if (currentUser?.id === userId) {
        setCurrentUser({ ...currentUser, passwordHash: simpleHash(newPassword_raw) });
    }
  };

  const value = {
    currentUser,
    users,
    tasks,
    events,
    meetings,
    news,
    login,
    logout,
    addUser,
    deleteUser,
    addTask,
    updateTaskStatus,
    deleteTask,
    addEvent,
    joinEvent,
    addMeeting,
    addNewsItem,
    updatePassword,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};