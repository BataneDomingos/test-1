import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, BookOpen, Users, Award } from 'lucide-react';
import { LoginForm } from '../components/Auth/LoginForm';
import { SignUpForm } from '../components/Auth/SignUpForm';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin(!isLogin);

  const features = [
    {
      icon: Trophy,
      title: 'Gamificação',
      description: 'Sistema de pontos, rankings e conquistas para motivar o aprendizado',
    },
    {
      icon: BookOpen,
      title: 'Quizzes Interativos',
      description: 'Crie quizzes personalizados com diferentes tipos de perguntas',
    },
    {
      icon: Users,
      title: 'Sessões ao Vivo',
      description: 'Jogos em tempo real com participação via PIN',
    },
    {
      icon: Award,
      title: 'Relatórios Detalhados',
      description: 'Acompanhe o progresso com estatísticas completas',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              LearnPlay
            </h1>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sistema de Aprendizagem com Gamificação
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Transforme o ensino em uma experiência interativa e divertida
          </p>

          <div className="space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              LearnPlay
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            <AnimatePresence mode="wait">
              {isLogin ? (
                <LoginForm key="login" onToggleMode={toggleMode} />
              ) : (
                <SignUpForm key="signup" onToggleMode={toggleMode} />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};