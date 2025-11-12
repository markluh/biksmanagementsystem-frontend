
import { GoogleGenAI } from "@google/genai";
import { User, Task, Event, Meeting, NewsItem } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Report generation will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateClubReport = async (data: {
  users: User[];
  tasks: Task[];
  events: Event[];
  meetings: Meeting[];
  news: NewsItem[];
}): Promise<string> => {
    if (!process.env.API_KEY) {
        return "Error: Gemini API key is not configured. Please set the API_KEY environment variable.";
    }

  const prompt = `
    Generate a concise, professional club activity report based on the following JSON data.
    The report should be easy to read for club leadership.
    Use markdown for formatting. Include sections for:
    1.  **Membership Overview**: Total number of members.
    2.  **Task Summary**: Number of tasks by status (Not Started, Ongoing, Finished). Highlight any overdue tasks if possible (not possible with current data, but a good idea).
    3.  **Event Roundup**: Mention upcoming and recent events, including attendance numbers for past events.
    4.  **Scheduled Meetings**: List upcoming meetings.
    5.  **Recent Communications**: Briefly summarize the latest news items.
    
    Here is the data:
    - Members: ${JSON.stringify(data.users.filter(u => u.role === 'MEMBER'), null, 2)}
    - Tasks: ${JSON.stringify(data.tasks, null, 2)}
    - Events: ${JSON.stringify(data.events, null, 2)}
    - Meetings: ${JSON.stringify(data.meetings, null, 2)}
    - News: ${JSON.stringify(data.news, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error generating report with Gemini:", error);
    return "Failed to generate report. An error occurred while contacting the AI service.";
  }
};
