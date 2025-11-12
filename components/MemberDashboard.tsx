import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { TasksIcon, EventsIcon, NewsIcon, ProfileIcon, LogoutIcon } from './common/icons';
import { Card } from './common/Card';
import { Task, TaskStatus } from '../types';
import { Modal } from './common/Modal';

type MemberView = 'tasks' | 'events' | 'news' | 'profile';

const MemberDashboard: React.FC = () => {
    const [view, setView] = useState<MemberView>('tasks');
    const { currentUser, logout } = useAppContext();

    const navItems = [
        { id: 'tasks', label: 'My Tasks', icon: TasksIcon },
        { id: 'events', label: 'Club Events', icon: EventsIcon },
        { id: 'news', label: 'News Board', icon: NewsIcon },
        { id: 'profile', label: 'My Profile', icon: ProfileIcon },
    ];
    
    const renderView = () => {
        switch(view) {
            case 'tasks': return <MyTasksPanel />;
            case 'events': return <ClubEventsPanel />;
            case 'news': return <NewsBoardPanel />;
            case 'profile': return <MyProfilePanel />;
            default: return <MyTasksPanel />;
        }
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
                    Member Area
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => setView(item.id as MemberView)} className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${view === item.id ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
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
                    <h1 className="text-4xl font-bold text-gray-800 capitalize">{view}</h1>
                    <p className="text-gray-500">Welcome back, {currentUser?.username}!</p>
                </header>
                {renderView()}
            </main>
        </div>
    );
};

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const { updateTaskStatus } = useAppContext();
    const statusColors: Record<TaskStatus, string> = {
        [TaskStatus.NOT_STARTED]: 'bg-gray-200 text-gray-800',
        [TaskStatus.ONGOING]: 'bg-blue-200 text-blue-800',
        [TaskStatus.FINISHED]: 'bg-green-200 text-green-800',
    };
    
    return (
        <Card>
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{task.title}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[task.status]}`}>{task.status}</span>
            </div>
             {task.dueDate && (
                <p className="text-sm text-red-600 font-semibold mt-1">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
            )}
            <p className="text-sm text-gray-600 mt-2 mb-4">{task.description}</p>
            <div className="flex space-x-2">
                <button disabled={task.status === TaskStatus.NOT_STARTED} onClick={() => updateTaskStatus(task.id, TaskStatus.NOT_STARTED)} className="text-xs px-3 py-1 rounded bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50">Not Started</button>
                <button disabled={task.status === TaskStatus.ONGOING} onClick={() => updateTaskStatus(task.id, TaskStatus.ONGOING)} className="text-xs px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50">Ongoing</button>
                <button disabled={task.status === TaskStatus.FINISHED} onClick={() => updateTaskStatus(task.id, TaskStatus.FINISHED)} className="text-xs px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50">Finished</button>
            </div>
        </Card>
    )
}

const MyTasksPanel = () => {
    const { currentUser, tasks } = useAppContext();
    const myTasks = tasks.filter(t => t.assignedTo === currentUser?.id);
    const ongoingTasks = myTasks.filter(t => t.status === TaskStatus.ONGOING);
    const notStartedTasks = myTasks.filter(t => t.status === TaskStatus.NOT_STARTED);
    const finishedTasks = myTasks.filter(t => t.status === TaskStatus.FINISHED);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Ongoing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ongoingTasks.length > 0 ? ongoingTasks.map(task => <TaskCard key={task.id} task={task}/>) : <p className="text-gray-500">No ongoing tasks.</p>}
                </div>
            </div>
             <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Not Started</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {notStartedTasks.length > 0 ? notStartedTasks.map(task => <TaskCard key={task.id} task={task}/>) : <p className="text-gray-500">No tasks to start.</p>}
                </div>
            </div>
             <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Finished</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {finishedTasks.length > 0 ? finishedTasks.map(task => <TaskCard key={task.id} task={task}/>) : <p className="text-gray-500">No finished tasks yet.</p>}
                </div>
            </div>
        </div>
    );
};

const ClubEventsPanel = () => {
    const { events, currentUser, joinEvent } = useAppContext();
    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = events.filter(e => new Date(e.date) < new Date()).sort((a,b)=> new Date(b.date).getTime() - new Date(a.date).getTime());

    const EventList = ({ title, eventList } : {title: string, eventList: typeof events}) => (
        <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventList.length > 0 ? eventList.map(event => {
                    const isAttending = currentUser ? event.attendees.includes(currentUser.id) : false;
                    return (
                        <Card key={event.id}>
                            <h3 className="font-bold text-lg">{event.name}</h3>
                            <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <p className="text-sm font-semibold">{event.attendees.length} attending</p>
                                { new Date(event.date) >= new Date() &&
                                    <button onClick={() => currentUser && joinEvent(event.id, currentUser.id)} className={`px-4 py-1 text-sm rounded ${isAttending ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                                        {isAttending ? 'Leave' : 'Join'}
                                    </button>
                                }
                            </div>
                        </Card>
                    )
                }) : <p className="text-gray-500 col-span-full">No events found in this category.</p>}
            </div>
        </div>
    );
    
    return (
        <div>
            <EventList title="Upcoming Events" eventList={upcomingEvents} />
            <EventList title="Past Events" eventList={pastEvents} />
        </div>
    );
};

const NewsBoardPanel = () => {
    const { news } = useAppContext();
    const sortedNews = [...news].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            {sortedNews.map(item => (
                <Card key={item.id}>
                    <h3 className="font-bold text-xl">{item.title}</h3>
                    <p className="text-sm text-gray-500">Posted on {new Date(item.createdAt).toLocaleDateString()}</p>
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">{item.content}</p>
                </Card>
            ))}
        </div>
    );
};

const MyProfilePanel = () => {
    const { currentUser, updatePassword } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleUpdatePassword = () => {
        setError('');
        setSuccess('');
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (currentUser) {
            updatePassword(currentUser.id, newPassword);
            setSuccess('Password updated successfully!');
            setIsModalOpen(false);
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <Card className="max-w-md mx-auto">
            <h2 className="text-xl font-bold">Profile Information</h2>
            <div className="mt-4 space-y-2">
                <p><strong>Username:</strong> {currentUser?.username}</p>
                <p><strong>Role:</strong> {currentUser?.role}</p>
            </div>
            <div className="mt-6 border-t pt-4">
                 {success && <p className="text-green-600 mb-4">{success}</p>}
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                    Change Password
                </button>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Change Password">
                <div className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border rounded" />
                    <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded" />
                    <button onClick={handleUpdatePassword} className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Update Password</button>
                </div>
            </Modal>
        </Card>
    );
};


export default MemberDashboard;
