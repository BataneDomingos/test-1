import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Save, Trash2, Image, Video, Clock } from 'lucide-react';
import { Quiz, Question } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface QuizCreatorProps {
  quiz?: Quiz | null;
  onBack: () => void;
  onSave: (quiz: Quiz) => void;
}

export const QuizCreator: React.FC<QuizCreatorProps> = ({ quiz, onBack, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: quiz?.title || '',
    description: quiz?.description || '',
  });
  const [questions, setQuestions] = useState<Question[]>(quiz?.questions || []);
  const [loading, setSaving] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `temp_${Date.now()}`,
      quiz_id: quiz?.id || '',
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: 0,
      time_limit: 30,
      points: 100,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updatedQuestions = questions.map((q, i) => 
      i === index ? { ...q, ...updates } : q
    );
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const saveQuiz = async () => {
    if (!formData.title.trim() || questions.length === 0) {
      alert('Por favor, adicione um título e pelo menos uma pergunta');
      return;
    }

    setSaving(true);
    try {
      let quizData;
      
      if (quiz?.id) {
        // Update existing quiz
        const { data, error } = await supabase
          .from('quizzes')
          .update({
            title: formData.title,
            description: formData.description,
          })
          .eq('id', quiz.id)
          .select()
          .single();

        if (error) throw error;
        quizData = data;

        // Delete existing questions
        await supabase
          .from('questions')
          .delete()
          .eq('quiz_id', quiz.id);
      } else {
        // Create new quiz
        const { data, error } = await supabase
          .from('quizzes')
          .insert([{
            title: formData.title,
            description: formData.description,
            created_by: user?.id,
          }])
          .select()
          .single();

        if (error) throw error;
        quizData = data;
      }

      // Insert questions
      if (questions.length > 0) {
        const questionsData = questions.map(q => ({
          quiz_id: quizData.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          correct_answer: q.correct_answer,
          time_limit: q.time_limit,
          image_url: q.image_url,
          video_url: q.video_url,
          points: q.points,
        }));

        const { error } = await supabase
          .from('questions')
          .insert(questionsData);

        if (error) throw error;
      }

      onSave({ ...quizData, questions });
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Erro ao salvar quiz. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {quiz ? 'Editar Quiz' : 'Criar Novo Quiz'}
            </h1>
            <p className="text-gray-600">Configure seu quiz e adicione perguntas</p>
          </div>
        </div>
        <motion.button
          onClick={saveQuiz}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>Salvar Quiz</span>
        </motion.button>
      </div>

      <div className="space-y-8">
        {/* Quiz Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações do Quiz</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Quiz
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite o título do quiz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Descreva o objetivo do quiz"
                rows={3}
              />
            </div>
          </div>
        </motion.div>

        {/* Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Perguntas ({questions.length})</h2>
            <motion.button
              onClick={addQuestion}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Pergunta</span>
            </motion.button>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-gray-200 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Pergunta {index + 1}
                  </h3>
                  <motion.button
                    onClick={() => removeQuestion(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texto da Pergunta
                    </label>
                    <textarea
                      value={question.question_text}
                      onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Digite a pergunta"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Pergunta
                      </label>
                      <select
                        value={question.question_type}
                        onChange={(e) => updateQuestion(index, { 
                          question_type: e.target.value as 'multiple_choice' | 'true_false',
                          options: e.target.value === 'true_false' ? ['Verdadeiro', 'Falso'] : ['', '', '', '']
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="multiple_choice">Múltipla Escolha</option>
                        <option value="true_false">Verdadeiro/Falso</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tempo Limite (segundos)
                      </label>
                      <input
                        type="number"
                        value={question.time_limit}
                        onChange={(e) => updateQuestion(index, { time_limit: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="10"
                        max="300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pontos
                      </label>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(index, { points: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="50"
                        max="1000"
                        step="50"
                      />
                    </div>
                  </div>

                  {question.question_type === 'multiple_choice' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opções de Resposta
                      </label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`correct_${question.id}`}
                              checked={question.correct_answer === optionIndex}
                              onChange={() => updateQuestion(index, { correct_answer: optionIndex })}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optionIndex] = e.target.value;
                                updateQuestion(index, { options: newOptions });
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder={`Opção ${optionIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.question_type === 'true_false' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resposta Correta
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`correct_${question.id}`}
                            checked={question.correct_answer === 0}
                            onChange={() => updateQuestion(index, { correct_answer: 0 })}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>Verdadeiro</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`correct_${question.id}`}
                            checked={question.correct_answer === 1}
                            onChange={() => updateQuestion(index, { correct_answer: 1 })}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>Falso</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">Nenhuma pergunta adicionada ainda</p>
                <motion.button
                  onClick={addQuestion}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Adicionar Primeira Pergunta
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};