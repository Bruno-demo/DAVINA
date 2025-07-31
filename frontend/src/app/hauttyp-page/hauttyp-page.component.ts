import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { QuizQuestionsComponent } from '../quiz-questions/quiz-questions.component';

@Component({
  selector: 'app-hauttyp-page',
  imports: [CommonModule,QuizQuestionsComponent],
  templateUrl: './hauttyp-page.component.html',
  styleUrl: './hauttyp-page.component.css'
})
export class HauttypPageComponent {

}
