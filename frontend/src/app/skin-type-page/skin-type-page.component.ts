import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { QuizQuestionsComponent } from '../quiz-questions/quiz-questions.component';

@Component({
  selector: 'app-skin-type-page',
  imports: [CommonModule,QuizQuestionsComponent],
  templateUrl: './skin-type-page.component.html',
  styleUrl: './skin-type-page.component.css'
})
export class SkinTypePageComponent {

}
