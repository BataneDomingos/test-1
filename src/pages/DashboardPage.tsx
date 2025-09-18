import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Layout/Header';
import { TeacherDashboard } from '../components/Dashboard/TeacherDashboard';
import { QuizCreator } from '../components/Quiz/QuizCreator';
import { GameLobby } from '../components/Game/GameLobby';
import { Quiz, GameSession, PlayerSession } from '../types';

type ViewMode = 'dashboard' | 'create' | 'edit' | 'lobby' | 'game' | 'stats';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<PlayerSession[]>([]);

  const handleCreateQuiz = () => {
    setSelectedQuiz(null);
    setCurrentView('create');
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('edit');
  };

  const handleStartGame = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('lobby');
  };

  const handleViewStats = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('stats');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedQuiz(null);
    setGameSession(null);
    setPlayers([]);
  };

  const handleQuizSaved = (quiz: Quiz) => {
    handleBackToDashboard();
  };

  const handleGameStart = (session: GameSession, playerList: PlayerSession[]) => {
    setGameSession(session);
    setPlayers(playerList);
    setCurrentView('game');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
      case 'edit':
        return (
          <QuizCreator
            quiz={selectedQuiz}
            onBack={handleBackToDashboard}
            onSave={handleQuizSaved}
          />
        );
      case 'lobby':
        return selectedQuiz ? (
          <GameLobby
            quiz={selectedQuiz}
            onBack={handleBackToDashboard}
            onStartGame={handleGameStart}
          />
        ) : null;
      case 'game':
        // TODO: Implement GameSession component
        return <div>Game Session - Coming Soon</div>;
      case 'stats':
        // TODO: Implement Stats component
        return <div>Statistics - Coming Soon</div>;
      default:
        return user?.role === 'teacher' ? (
          <TeacherDashboard
            onCreateQuiz={handleCreateQuiz}
            onEditQuiz={handleEditQuiz}
            onStartGame={handleStartGame}
            onViewStats={handleViewStats}
          />
        ) : (
          <div>Student Dashboard - Coming Soon</div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>
    </div>
  );
};