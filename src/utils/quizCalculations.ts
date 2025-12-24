import type { ProcessedPlayer, GameRecord } from '../types';
import {
  calculatePerfectMonths,
  calculateSocialButterfly,
  calculateCommunityStreak
} from './playerStats';

// ============================================
// TYPES
// ============================================

export interface QuizQuestion {
  id: string;
  category: 'organization' | 'personal';
  questionKey: string; // i18n key for the question text
  correctAnswer: number;
  min: number;
  max: number;
  anchor?: {
    value: number;
    labelKey: string; // i18n key for anchor label
  };
}

export interface QuizSlide {
  titleKey: string; // i18n key for slide title
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
}

export interface QuizResult {
  answers: QuizAnswer[];
  totalCorrect: number;
  totalQuestions: number;
}

// ============================================
// QUESTION GENERATION
// ============================================

/**
 * Generate all quiz questions with correct answers
 */
export const generateQuizQuestions = (
  player: ProcessedPlayer,
  allPlayers: ProcessedPlayer[],
  games2024: GameRecord[],
  games2025: GameRecord[]
): QuizSlide[] => {
  // Calculate community stats
  const totalGames2025 = games2025.filter(g => g.played).length;
  const totalGames2024 = games2024.filter(g => g.played).length;
  const communityStreak = calculateCommunityStreak(games2024, games2025);

  // Calculate player stats
  const perfectMonths = calculatePerfectMonths(player.dates2025, games2025);
  const socialButterfly = calculateSocialButterfly(
    player.name,
    player.dates2025,
    allPlayers
  );

  return [
    // Slide 1: Organization
    {
      titleKey: 'quiz.slides.organization',
      questions: [
        {
          id: 'org_total_games',
          category: 'organization',
          questionKey: 'quiz.questions.totalGames2025',
          correctAnswer: totalGames2025,
          min: 30,
          max: 55,
          anchor: {
            value: totalGames2024,
            labelKey: 'quiz.anchor.2024'
          }
        },
        {
          id: 'org_longest_streak',
          category: 'organization',
          questionKey: 'quiz.questions.communityStreak',
          correctAnswer: communityStreak.streakLength,
          min: 5,
          max: 30
        }
      ]
    },
    // Slide 2: Personal Games
    {
      titleKey: 'quiz.slides.personalGames',
      questions: [
        {
          id: 'personal_total_games',
          category: 'personal',
          questionKey: 'quiz.questions.yourTotalGames',
          correctAnswer: player.total2025,
          min: 0,
          max: 50,
          anchor: {
            value: player.total2024,
            labelKey: 'quiz.anchor.2024'
          }
        },
        {
          id: 'personal_rank',
          category: 'personal',
          questionKey: 'quiz.questions.yourRank',
          correctAnswer: player.rank2025,
          min: 1,
          max: allPlayers.length
        }
      ]
    },
    // Slide 3: Personal Achievements
    {
      titleKey: 'quiz.slides.achievements',
      questions: [
        {
          id: 'personal_perfect_months',
          category: 'personal',
          questionKey: 'quiz.questions.perfectMonths',
          correctAnswer: perfectMonths.length,
          min: 0,
          max: 12
        },
        {
          id: 'personal_streak',
          category: 'personal',
          questionKey: 'quiz.questions.yourStreak',
          correctAnswer: player.longestStreak2025,
          min: 0,
          max: 25
        },
        {
          id: 'personal_teammates',
          category: 'personal',
          questionKey: 'quiz.questions.uniqueTeammates',
          correctAnswer: socialButterfly.uniquePlayersCount,
          min: 0,
          max: socialButterfly.totalPlayersCount + 5
        }
      ]
    }
  ];
};

// ============================================
// ANSWER CHECKING
// ============================================

/**
 * Check if user answer is correct (exact match)
 */
export const checkAnswer = (userAnswer: number, correctAnswer: number): boolean => {
  return userAnswer === correctAnswer;
};

/**
 * Calculate quiz results
 */
export const calculateQuizResults = (
  slides: QuizSlide[],
  userAnswers: Record<string, number>
): QuizResult => {
  const answers: QuizAnswer[] = [];
  let totalCorrect = 0;

  slides.forEach(slide => {
    slide.questions.forEach(question => {
      const userAnswer = userAnswers[question.id] ?? 0;
      const isCorrect = checkAnswer(userAnswer, question.correctAnswer);

      if (isCorrect) {
        totalCorrect++;
      }

      answers.push({
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      });
    });
  });

  const totalQuestions = answers.length;

  return {
    answers,
    totalCorrect,
    totalQuestions
  };
};

/**
 * Get all questions from slides as flat array
 */
export const getAllQuestions = (slides: QuizSlide[]): QuizQuestion[] => {
  return slides.flatMap(slide => slide.questions);
};
