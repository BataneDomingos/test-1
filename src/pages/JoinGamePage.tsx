import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const JoinGamePage: React.FC = () => {
  const [pin, setPin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameFound, setGameFound] = useState(false);
  const [gameSessionId, setGameSessionId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Redireciona quando professor inicia o jogo
  useEffect(() => {
    if (!gameFound || !gameSessionId) return;

    const subscription = supabase
      .from(`game_sessions:id=eq.${gameSessionId}`)
      .on('UPDATE', (payload) => {
        if (payload.new.status === 'started') {
          navigate(`/game/${gameSessionId}`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [gameFound, gameSessionId, navigate]);

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || !playerName.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Verifica se a sessão do jogo existe
      const { data: gameSession, error: gameError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('pin', pin)
        .eq('status', 'waiting')
        .single();

      if (gameError || !gameSession) {
        setError('Jogo não encontrado ou já iniciado');
        setLoading(false);
        return;
      }

      // Verifica se o nome já está sendo usado
      const { data: existingPlayer } = await supabase
        .from('player_sessions')
        .select('id')
        .eq('game_session_id', gameSession.id)
        .eq('player_name', playerName)
        .single();

      if (existingPlayer) {
        setError('Este nome já está sendo usado no jogo');
        setLoading(false);
        return;
      }

      // Adiciona o jogador
      const { error: joinError } = await supabase
        .from('player_sessions')
        .insert([
          {
            game_session_id: gameSession.id,
            player_name: playerName,
            score: 0,
            answers: [],
          }
        ]);

      if (joinError) throw joinError;

      setGameSessionId(gameSession.id);
      setGameFound(true);

    } catch (error) {
      console.error('Erro ao entrar no jogo:', error);
      setError('Erro ao entrar no jogo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (gameFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Você entrou no jogo!
          </h2>
          <p className="text-gray-600 mb-6">
            Aguarde o professor iniciar o jogo...
          </p>
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              LearnPlay
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Entrar no Jogo
          </h2>
          <p className="text-gray-600">
            Digite o PIN do jogo e seu nome para participar
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <form onSubmit={handleJoinGame} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN do Jogo
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-4 text-center text-2xl font-mono font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seu Nome
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Digite seu nome"
                maxLength={20}
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading || !pin.trim() || !playerName.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Jogo</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Não tem o PIN? Peça para o professor compartilhar
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
