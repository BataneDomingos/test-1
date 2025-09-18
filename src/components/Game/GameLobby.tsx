import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Users, Play, RefreshCw } from 'lucide-react';
import { Quiz, GameSession, PlayerSession } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface GameLobbyProps {
  quiz: Quiz;
  onBack: () => void;
  onStartGame: (gameSession: GameSession, players: PlayerSession[]) => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({ quiz, onBack, onStartGame }) => {
  const { user } = useAuth();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<PlayerSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createGameSession();
  }, []);

  useEffect(() => {
    if (gameSession) {
      const subscription = supabase
        .channel(`game_session_${gameSession.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'player_sessions',
          filter: `game_session_id=eq.${gameSession.id}`,
        }, (payload) => {
          loadPlayers();
        })
        .subscribe();

      loadPlayers();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [gameSession]);

  const createGameSession = async () => {
    try {
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      
      const { data, error } = await supabase
        .from('game_sessions')
        .insert([
          {
            quiz_id: quiz.id,
            pin,
            status: 'waiting',
            current_question: 0,
            created_by: user?.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setGameSession(data);
    } catch (error) {
      console.error('Error creating game session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlayers = async () => {
    if (!gameSession) return;

    try {
      const { data, error } = await supabase
        .from('player_sessions')
        .select('*')
        .eq('game_session_id', gameSession.id)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const copyPin = () => {
    if (gameSession) {
      navigator.clipboard.writeText(gameSession.pin);
      // You could add a toast notification here
    }
  };

  const handleStartGame = () => {
    if (gameSession && players.length > 0) {
      onStartGame(gameSession, players);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center space-x-4 mb-8">
        <motion.button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sala de Espera</h1>
          <p className="text-gray-600">{quiz.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Game PIN */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-8 text-white text-center"
        >
          <h2 className="text-2xl font-bold mb-4">PIN do Jogo</h2>
          <div className="text-6xl font-mono font-bold mb-6">
            {gameSession?.pin}
          </div>
          <motion.button
            onClick={copyPin}
            className="flex items-center space-x-2 px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Copy className="w-5 h-5" />
            <span>Copiar PIN</span>
          </motion.button>
          <p className="text-white/80 text-sm mt-4">
            Compartilhe este PIN para os jogadores se juntarem
          </p>
        </motion.div>

        {/* Game Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações do Quiz</h2>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-500">Título</span>
              <p className="text-lg font-medium">{quiz.title}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Descrição</span>
              <p className="text-gray-700">{quiz.description}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Perguntas</span>
              <p className="text-lg font-medium">{quiz.questions?.length} perguntas</p>
            </div>
          </div>
        </motion.div>

        {/* Players List */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Jogadores ({players.length})
              </h2>
            </div>
            <motion.button
              onClick={loadPlayers}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
          </div>

          {players.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aguardando jogadores...
              </h3>
              <p className="text-gray-600">
                Compartilhe o PIN para os jogadores se juntarem ao jogo
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-4 text-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">
                        {player.player_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 truncate">
                      {player.player_name}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={handleStartGame}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={players.length === 0}
              >
                <Play className="w-6 h-6" />
                <span>Iniciar Jogo</span>
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};