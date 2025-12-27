import type { ProcessedPlayer, GameRecord } from '../types';
import {
  calculatePerfectMonths,
  calculateSocialButterfly,
  calculateCommunityStreak,
  calculatePeakPerformance
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
  margin: number; // Allowed margin of error (±X)
  anchor?: {
    value: number;
    labelKey: string; // i18n key for anchor label
  };
}

export interface MultipleChoiceQuestion {
  id: string;
  questionKey: string; // i18n key for the question text
  correctAnswer: string; // Player name
  options: string[]; // 5 player names (shuffled)
}

export interface QuizSlide {
  titleKey: string; // i18n key for slide title
  questions: QuizQuestion[];
  multipleChoiceQuestions?: MultipleChoiceQuestion[];
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: number;
  correctAnswer: number;
  margin: number;
  isCorrect: boolean;
  isExact: boolean; // True if exact match, false if within margin
}

export interface MultipleChoiceAnswer {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface QuizResult {
  answers: QuizAnswer[];
  multipleChoiceAnswers: MultipleChoiceAnswer[];
  totalCorrect: number;
  totalQuestions: number;
}

// ============================================
// QUESTION GENERATION
// ============================================

/**
 * Shuffle array using Fisher-Yates algorithm
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Generate player-based multiple choice questions (split into two groups)
 */
const generatePlayerQuestions = (
  allPlayers: ProcessedPlayer[],
  games2025: GameRecord[]
): { triviaQuestions: MultipleChoiceQuestion[]; movementQuestions: MultipleChoiceQuestion[] } => {
  const triviaQuestions: MultipleChoiceQuestion[] = [];
  const movementQuestions: MultipleChoiceQuestion[] = [];

  // 1. Player with most games in 2025
  const sortedByGames = [...allPlayers].sort((a, b) => b.total2025 - a.total2025);
  const top5ByGames = sortedByGames.slice(0, 5).map(p => p.name);
  triviaQuestions.push({
    id: 'player_most_games',
    questionKey: 'quiz.questions.playerMostGames',
    correctAnswer: sortedByGames[0].name,
    options: shuffleArray(top5ByGames)
  });

  // 2. Player with best streak
  const playersWithStreak = allPlayers.map(p => ({
    name: p.name,
    streak: calculatePeakPerformance(p.dates2025 || [], games2025).streakLength
  }));
  const sortedByStreak = [...playersWithStreak].sort((a, b) => b.streak - a.streak);
  const top5ByStreak = sortedByStreak.slice(0, 5).map(p => p.name);
  triviaQuestions.push({
    id: 'player_best_streak',
    questionKey: 'quiz.questions.playerBestStreak',
    correctAnswer: sortedByStreak[0].name,
    options: shuffleArray(top5ByStreak)
  });

  // 3. Player with biggest rise (vs 2024) - must have played in 2024
  const returning = allPlayers.filter(p => p.total2024 > 0 && p.total2025 > 0);
  const withChanges = returning.map(p => ({ name: p.name, change: p.total2025 - p.total2024 }));

  const risers = withChanges.filter(p => p.change > 0).sort((a, b) => b.change - a.change);
  if (risers.length >= 5) {
    const top5Risers = risers.slice(0, 5).map(p => p.name);
    movementQuestions.push({
      id: 'player_biggest_rise',
      questionKey: 'quiz.questions.playerBiggestRise',
      correctAnswer: risers[0].name,
      options: shuffleArray(top5Risers)
    });
  }

  // 4. Player with biggest decline (vs 2024) - must have played in 2024
  const fallers = withChanges.filter(p => p.change < 0).sort((a, b) => a.change - b.change);
  if (fallers.length >= 5) {
    const top5Fallers = fallers.slice(0, 5).map(p => p.name);
    movementQuestions.push({
      id: 'player_biggest_decline',
      questionKey: 'quiz.questions.playerBiggestDecline',
      correctAnswer: fallers[0].name,
      options: shuffleArray(top5Fallers)
    });
  }

  return { triviaQuestions, movementQuestions };
};

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

  // Generate player-based multiple choice questions
  const { triviaQuestions, movementQuestions } = generatePlayerQuestions(allPlayers, games2025);

  const slides: QuizSlide[] = [
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
          margin: 4,
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
          min: 10,
          max: 60,
          margin: 3
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
          margin: 3,
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
          max: allPlayers.length,
          margin: 2
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
          max: 12,
          margin: 1
        },
        {
          id: 'personal_streak',
          category: 'personal',
          questionKey: 'quiz.questions.yourStreak',
          correctAnswer: player.longestStreak2025,
          min: 0,
          max: 25,
          margin: 2
        },
        {
          id: 'personal_teammates',
          category: 'personal',
          questionKey: 'quiz.questions.uniqueTeammates',
          correctAnswer: socialButterfly.uniquePlayersCount,
          min: 0,
          max: socialButterfly.totalPlayersCount + 5,
          margin: 3
        }
      ]
    },
    // Slide 4: Player Trivia (Multiple Choice)
    {
      titleKey: 'quiz.slides.playerTrivia',
      questions: [],
      multipleChoiceQuestions: triviaQuestions
    }
  ];

  // Slide 5: Player Movement (only if we have questions)
  if (movementQuestions.length > 0) {
    slides.push({
      titleKey: 'quiz.slides.playerMovement',
      questions: [],
      multipleChoiceQuestions: movementQuestions
    });
  }

  return slides;
};

// ============================================
// ANSWER CHECKING
// ============================================

/**
 * Check if user answer is correct (within margin)
 */
export const checkAnswer = (userAnswer: number, correctAnswer: number, margin: number): { isCorrect: boolean; isExact: boolean } => {
  const isExact = userAnswer === correctAnswer;
  const isWithinMargin = Math.abs(userAnswer - correctAnswer) <= margin;
  return {
    isCorrect: isExact || isWithinMargin,
    isExact
  };
};

/**
 * Calculate quiz results
 */
export const calculateQuizResults = (
  slides: QuizSlide[],
  userAnswers: Record<string, number>,
  multipleChoiceUserAnswers: Record<string, string> = {}
): QuizResult => {
  const answers: QuizAnswer[] = [];
  const multipleChoiceAnswers: MultipleChoiceAnswer[] = [];
  let totalCorrect = 0;

  slides.forEach(slide => {
    // Handle slider questions
    slide.questions.forEach(question => {
      const userAnswer = userAnswers[question.id] ?? 0;
      const { isCorrect, isExact } = checkAnswer(userAnswer, question.correctAnswer, question.margin);

      if (isCorrect) {
        totalCorrect++;
      }

      answers.push({
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        margin: question.margin,
        isCorrect,
        isExact
      });
    });

    // Handle multiple choice questions
    if (slide.multipleChoiceQuestions) {
      slide.multipleChoiceQuestions.forEach(question => {
        const userAnswer = multipleChoiceUserAnswers[question.id] ?? '';
        const isCorrect = userAnswer === question.correctAnswer;

        if (isCorrect) {
          totalCorrect++;
        }

        multipleChoiceAnswers.push({
          questionId: question.id,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect
        });
      });
    }
  });

  const totalQuestions = answers.length + multipleChoiceAnswers.length;

  return {
    answers,
    multipleChoiceAnswers,
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
