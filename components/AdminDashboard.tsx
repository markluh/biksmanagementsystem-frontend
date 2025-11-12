import React, { useState, ReactNode } from 'react';
import { useAppContext } from '../context/AppContext';
import { UsersIcon, TasksIcon, EventsIcon, MeetingsIcon, NewsIcon, ReportsIcon, LogoutIcon, PlusIcon, TrashIcon, EyeIcon } from './common/icons';
import { Modal } from './common/Modal';
import { Card } from './common/Card';
import { TaskStatus, User, Role } from '../types';
import { generateClubReport } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type AdminView = 'dashboard' | 'members' | 'tasks' | 'events' | 'meetings' | 'news' | 'reports';

const AdminDashboard: React.FC = () => {
    const [view, setView] = useState<AdminView>('dashboard');
    const { logout, users } = useAppContext();
    const memberCount = users.filter(u => u.role === Role.MEMBER).length;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ReportsIcon },
        { id: 'members', label: 'Members', icon: UsersIcon },
        { id: 'tasks', label: 'Tasks', icon: TasksIcon },
        { id: 'events', label: 'Events', icon: EventsIcon },
        { id: 'meetings', label: 'Meetings', icon: MeetingsIcon },
        { id: 'news', label: 'News Wall', icon: NewsIcon },
        { id: 'reports', label: 'Generate Report', icon: ReportsIcon },
    ];
    
    const renderView = () => {
        switch(view) {
            case 'dashboard': return <DashboardPanel />;
            case 'members': return <ManageMembersPanel />;
            case 'tasks': return <ManageTasksPanel />;
            case 'events': return <ManageEventsPanel />;
            case 'meetings': return <ManageMeetingsPanel />;
            case 'news': return <ManageNewsPanel />;
            case 'reports': return <GenerateReportPanel />;
            default: return <DashboardPanel />;
        }
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
                    Admin Panel
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => setView(item.id as AdminView)} className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${view === item.id ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                            <item.icon className="h-5 w-5 mr-3"/>
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="px-2 py-4 border-t border-gray-700">
                     <button onClick={logout} className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">
                        <LogoutIcon className="h-5 w-5 mr-3"/>
                        Logout
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                 <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 capitalize">{view.replace(/([A-Z])/g, ' $1')}</h1>
                    <p className="text-gray-500">Welcome, Admin! You have {memberCount} active members.</p>
                </header>
                {renderView()}
            </main>
        </div>
    );
};


const DashboardPanel = () => {
    const { users, tasks, events } = useAppContext();
    const members = users.filter(u => u.role === Role.MEMBER);
    
    const taskStatusData = [
        { name: 'Not Started', count: tasks.filter(t => t.status === TaskStatus.NOT_STARTED).length },
        { name: 'Ongoing', count: tasks.filter(t => t.status === TaskStatus.ONGOING).length },
        { name: 'Finished', count: tasks.filter(t => t.status === TaskStatus.FINISHED).length },
    ];

    const upcomingEvents = events.filter(e => new Date(e.date) > new Date());

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                <h2 className="text-xl font-bold mb-4">Club Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">{members.length}</p>
                        <p className="text-sm text-blue-500">Total Members</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">{tasks.length}</p>
                        <p className="text-sm text-green-500">Total Tasks</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-3xl font-bold text-purple-600">{events.length}</p>
                        <p className="text-sm text-purple-500">Total Events</p>
                    </div>
                </div>
            </Card>
            <Card className="col-span-1 md:col-span-2">
                <h2 className="text-xl font-bold mb-4">Task Status Distribution</h2>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={taskStatusData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#4f46e5" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
             <Card className="col-span-1">
                <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
                <div className="space-y-3">
                {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 4).map(event => (
                    <div key={event.id} className="p-3 bg-gray-50 rounded-md">
                        <p className="font-semibold text-gray-800">{event.name}</p>
                        <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                )) : <p className="text-gray-500">No upcoming events.</p>}
                </div>
            </Card>
        </div>
    );
}

const ManageMembersPanel = () => {
    const { users, addUser, deleteUser } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const members = users.filter(u => u.role === 'MEMBER');

    const handleAddUser = () => {
        if (username && password) {
            addUser(username, password);
            setUsername('');
            setPassword('');
            setIsModalOpen(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Members ({members.length})</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" /> Add Member
                </button>
            </div>

            <Card>
                <div className="divide-y divide-gray-200">
                    {members.map(member => (
                        <div key={member.id} className="py-4 flex justify-between items-center">
                            <span className="text-gray-800 font-medium">{member.username}</span>
                            <button onClick={() => deleteUser(member.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                    {members.length === 0 && <p className="text-gray-500 py-4">No members yet.</p>}
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Member">
                <div className="space-y-4">
                    <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 border rounded" />
                    <input type="password" placeholder="Initial Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" />
                    <button onClick={handleAddUser} className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Create Member</button>
                </div>
            </Modal>
        </div>
    );
};

const ManageTasksPanel = () => {
    const { tasks, users, addTask, deleteTask } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [dueDate, setDueDate] = useState('');

    const members = users.filter(u => u.role === Role.MEMBER);

    const handleAddTask = () => {
        if (title && description && assignedTo) {
            addTask(title, description, assignedTo, dueDate || undefined);
            setTitle('');
            setDescription('');
            setAssignedTo('');
            setDueDate('');
            setIsModalOpen(false);
        }
    };

    const getUsernameById = (id: string) => users.find(u => u.id === id)?.username || 'Unassigned';
    
    const statusColors: Record<TaskStatus, string> = {
        [TaskStatus.NOT_STARTED]: 'bg-gray-200 text-gray-800',
        [TaskStatus.ONGOING]: 'bg-blue-200 text-blue-800',
        [TaskStatus.FINISHED]: 'bg-green-200 text-green-800',
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Tasks ({tasks.length})</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" /> Assign Task
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map(task => (
                    <Card key={task.id} className="flex flex-col">
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg mb-1 pr-2">{task.title}</h3>
                                <span className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${statusColors[task.status]}`}>{task.status}</span>
                            </div>
                            <p className="text-sm text-gray-500">Assigned to: <strong>{getUsernameById(task.assignedTo)}</strong></p>
                            {task.dueDate && (
                            <p className="text-sm text-red-600 font-semibold mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                            )}
                            <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                        </div>
                         <div className="mt-4 pt-4 border-t flex justify-end items-center">
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this task permanently?')) {
                                        deleteTask(task.id);
                                    }
                                }}
                                className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                                title="Delete Task"
                                aria-label="Delete task"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign New Task">
                <div className="space-y-4">
                    <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" />
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" />
                    <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full p-2 border rounded bg-white">
                        <option value="" disabled>Assign to a member</option>
                        {members.map(member => <option key={member.id} value={member.id}>{member.username}</option>)}
                    </select>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date (Optional)</label>
                        <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border rounded mt-1" />
                    </div>
                    <button onClick={handleAddTask} className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Assign Task</button>
                </div>
            </Modal>
        </div>
    );
};

const ManageEventsPanel = () => {
    const { events, addEvent, users } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');

    const handleAddEvent = () => {
        if(name && description && date) {
            addEvent(name, description, date);
            setName('');
            setDescription('');
            setDate('');
            setIsModalOpen(false);
        }
    };
    
    const getUsernameById = (id: string) => users.find(u => u.id === id)?.username;

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Events ({events.length})</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" /> Create Event
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                    <Card key={event.id}>
                        <h3 className="font-bold text-lg">{event.name}</h3>
                        <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                        <div className="mt-4 pt-4 border-t">
                             <p className="text-sm font-semibold">{event.attendees.length} attending</p>
                             <div className="text-xs text-gray-500 mt-1">
                                {event.attendees.map(id => getUsernameById(id)).join(', ')}
                             </div>
                        </div>
                    </Card>
                ))}
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Event">
                <div className="space-y-4">
                    <input type="text" placeholder="Event Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" />
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded" />
                    <button onClick={handleAddEvent} className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Create Event</button>
                </div>
            </Modal>
        </div>
    );
};

const ManageMeetingsPanel = () => {
    const { meetings, addMeeting } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topic, setTopic] = useState('');
    const [date, setDate] = useState('');
    const [notes, setNotes] = useState('');

    const handleAddMeeting = () => {
        if(topic && date) {
            addMeeting(topic, date, notes);
            setTopic('');
            setDate('');
            setNotes('');
            setIsModalOpen(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Schedule Meetings</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" /> Schedule Meeting
                </button>
            </div>
            <div className="space-y-4">
                {meetings.map(meeting => (
                    <Card key={meeting.id}>
                        <h3 className="font-bold text-lg">{meeting.topic}</h3>
                        <p className="text-sm text-gray-500">{new Date(meeting.date).toLocaleString()}</p>
                        <p className="mt-2 text-gray-700 whitespace-pre-wrap">{meeting.notes}</p>
                    </Card>
                ))}
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Meeting">
                <div className="space-y-4">
                    <input type="text" placeholder="Meeting Topic" value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-2 border rounded" />
                    <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded" />
                    <textarea placeholder="Notes / Agenda (optional)" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded" />
                    <button onClick={handleAddMeeting} className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Schedule</button>
                </div>
            </Modal>
        </div>
    );
};

const ManageNewsPanel = () => {
    const { news, addNewsItem } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleAddNews = () => {
        if (title && content) {
            addNewsItem(title, content);
            setTitle('');
            setContent('');
            setIsModalOpen(false);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">News Wall</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" /> Post News
                </button>
            </div>
             <div className="space-y-4">
                {news.map(item => (
                    <Card key={item.id}>
                        <h3 className="font-bold text-xl">{item.title}</h3>
                        <p className="text-sm text-gray-500">Posted on {new Date(item.createdAt).toLocaleDateString()}</p>
                        <p className="mt-2 text-gray-700 whitespace-pre-wrap">{item.content}</p>
                    </Card>
                ))}
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post New Item">
                <div className="space-y-4">
                    <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" />
                    <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full p-2 border rounded" />
                    <button onClick={handleAddNews} className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Post</button>
                </div>
            </Modal>
        </div>
    );
};

const GenerateReportPanel = () => {
    const { users, tasks, events, meetings, news } = useAppContext();
    const [report, setReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setReport('');
        try {
            const result = await generateClubReport({ users, tasks, events, meetings, news });
            setReport(result);
        } catch (error) {
            setReport('An error occurred while generating the report.');
            console.error(error);
        }
        setIsLoading(false);
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Generate Activity Report</h2>
            <p className="text-gray-600 mb-6">Click the button below to generate a comprehensive club activity report using Gemini. This may take a few moments.</p>
            <button onClick={handleGenerateReport} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Generating...' : 'Generate Report'}
            </button>
            {isLoading && <div className="mt-4 animate-pulse">Generating your report, please wait...</div>}
            {report && (
                <div className="mt-6 p-4 border rounded bg-gray-50">
                    <h3 className="text-xl font-bold mb-2">Generated Report</h3>
                    <pre className="whitespace-pre-wrap font-sans text-gray-800">{report}</pre>
                </div>
            )}
        </Card>
    );
};

export default AdminDashboard;