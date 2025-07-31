import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { QuizService } from '../services/quizz';
import { QuizQuestion } from '../models/quizz-question.model';
import { QuizResponseResult } from '../models/quizz-response.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-quiz-questions',
  imports: [CommonModule,RouterModule],
  templateUrl: './quiz-questions.component.html',
  styleUrls: ['./quiz-questions.component.css']
})


export class QuizQuestionsComponent implements OnInit {
  questions: QuizQuestion[] = [];
  currentQuestionIndex = 0;
  selectedAnswers: Record<string, string> = {};
  skinType = '';
  skinAdvice = '';
  isLoading = true;
  userId = '12345';

  constructor(private quizService: QuizService) {}

  ngOnInit() {
    this.quizService.getQuizQuestions().subscribe((qs: QuizQuestion[]) => {
      this.questions = qs;
      this.isLoading = false;
    })
  }

  selectAnswer(answer: string) {
    const currentKey = this.questions[this.currentQuestionIndex].key;
    this.selectedAnswers[currentKey] = answer;
  }

  nextQuestion() {
    if (this.selectedAnswers[this.questions[this.currentQuestionIndex].key]) {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
      }
    }
  }


  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  isLastQuestion() {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  finishQuiz() {
    const payload = { userId: this.userId, answers: this.selectedAnswers };
    this.quizService.submitQuizResponses(payload).subscribe((res: QuizResponseResult) => {
      this.skinType = res.result;
      this.skinAdvice = res.advice;
    });
  }

  resetQuiz() {
    this.currentQuestionIndex = 0;
    this.selectedAnswers = {};
    this.skinType = '';
    this.skinAdvice = '';
  }
}
