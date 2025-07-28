// src/utils/session.js
export const setSession = (userData) => {
  const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
  const sessionData = {
    id: sessionId,
    user: userData,
    timestamp: new Date().getTime()
  };
  sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
  return sessionId;
};

export const getSession = () => {
  const sessionData = sessionStorage.getItem('adminSession');
  if (!sessionData) return null;
  
  return JSON.parse(sessionData);
};

export const clearSession = () => {
  sessionStorage.removeItem('adminSession');
};

export const isSessionValid = () => {
  const session = getSession();
  if (!session) return false;
  
  const THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutes in milliseconds
  const currentTime = new Date().getTime();
  
  return (currentTime - session.timestamp) < THIRTY_MINUTES;
};

export const updateSessionTimestamp = () => {
  const session = getSession();
  if (session) {
    session.timestamp = new Date().getTime();
    sessionStorage.setItem('adminSession', JSON.stringify(session));
  }
};