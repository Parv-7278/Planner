import { GroupSession } from '../types';

const STORAGE_KEY_GROUP = 'dayly_group_session';

class GroupServiceClass {
  private getStoredSession(): GroupSession {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GROUP);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }

    // Default lively group session
    return {
      id: 'grp-delhi-weekend',
      title: 'Delhi Weekend Squad Planning 🎉',
      creatorName: 'Parv',
      passcode: 'DAYLY-99',
      participants: ['Parv (You)', 'Ananya', 'Rohan', 'Sneha'],
      votes: {
        'exp-craft-1': {
          up: 3,
          down: 1,
          users: { 'Parv (You)': 'up', Ananya: 'up', Sneha: 'up', Rohan: 'down' }
        },
        'exp-food-1': {
          up: 4,
          down: 0,
          users: { 'Parv (You)': 'up', Ananya: 'up', Rohan: 'up', Sneha: 'up' }
        },
        'exp-ent-1': {
          up: 3,
          down: 1,
          users: { 'Parv (You)': 'up', Rohan: 'up', Sneha: 'up', Ananya: 'down' }
        },
        'exp-act-1': {
          up: 2,
          down: 2,
          users: { Rohan: 'up', 'Parv (You)': 'up', Ananya: 'down', Sneha: 'down' }
        }
      }
    };
  }

  getSession(): GroupSession {
    return this.getStoredSession();
  }

  vote(experienceId: string, userVote: 'up' | 'down', userName: string = 'Parv (You)'): GroupSession {
    const session = this.getStoredSession();
    if (!session.votes[experienceId]) {
      session.votes[experienceId] = { up: 0, down: 0, users: {} };
    }

    const currentVoterChoice = session.votes[experienceId].users[userName];

    if (currentVoterChoice === userVote) {
      // Toggle off
      delete session.votes[experienceId].users[userName];
      if (userVote === 'up') session.votes[experienceId].up--;
      else session.votes[experienceId].down--;
    } else {
      if (currentVoterChoice === 'up') session.votes[experienceId].up--;
      if (currentVoterChoice === 'down') session.votes[experienceId].down--;

      session.votes[experienceId].users[userName] = userVote;
      if (userVote === 'up') session.votes[experienceId].up++;
      else session.votes[experienceId].down++;
    }

    localStorage.setItem(STORAGE_KEY_GROUP, JSON.stringify(session));
    return session;
  }

  addParticipant(name: string): GroupSession {
    const session = this.getStoredSession();
    if (!session.participants.includes(name)) {
      session.participants.push(name);
      localStorage.setItem(STORAGE_KEY_GROUP, JSON.stringify(session));
    }
    return session;
  }
}

export const GroupService = new GroupServiceClass();
