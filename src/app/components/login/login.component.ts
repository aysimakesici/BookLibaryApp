import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],  
  providers: [DatePipe] 
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  passwordFieldType: string = 'password';
  dateNow!: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private datePipe: DatePipe
  ) {
    this.dateNow = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')!;
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: (response) => {
          this.snackBar.open('Login successful', 'Close', { duration: 3000 });

          if (response.authenticateResult) {
            // Kullanıcı bilgilerini yerel depolamaya kaydedin
            this.authService.getToken().subscribe({
              next: (token) => {
                localStorage.setItem("AuthToken", token);
                this.authService.getCurrentUser().subscribe(user => {
                  if (user && user.isAdmin) {
                    this.router.navigate(['/admin']);
                  } else {
                    this.router.navigate(['/my-books']);
                  }
                });
              },
              error: (error) => {
                console.log("Token alınamadı: ", error);
              }
            });
          } else {
            this.snackBar.open('Login failed', 'Close', { duration: 3000 });
          }
        },
        error: (error) => {
          this.snackBar.open('Login failed', 'Close', { duration: 3000 });
          console.error('Login failed', error);
        }
      });
    }
  }
}
