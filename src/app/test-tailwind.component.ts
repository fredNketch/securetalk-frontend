import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-tailwind',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 p-8"
    >
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold text-center text-gradient mb-8">
          🎨 Tailwind CSS fonctionne !
        </h1>

        <!-- Test des boutons -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button class="btn-primary">Primary</button>
          <button class="btn-secondary">Secondary</button>
          <button class="btn-outline">Outline</button>
          <button class="btn-ghost">Ghost</button>
        </div>

        <!-- Test des cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold">Test Card</h3>
            </div>
            <div class="card-body">
              <p class="text-gray-600">
                Cette card utilise les classes Tailwind personnalisées de
                SecureTalk.
              </p>
            </div>
          </div>

          <div class="card-elevated">
            <div class="card-body">
              <div class="flex items-center gap-3 mb-4">
                <div class="avatar avatar-md">
                  <div
                    class="w-full h-full bg-primary-500 rounded-full flex items-center justify-center text-white font-medium"
                  >
                    JD
                  </div>
                  <div class="avatar-status status-online"></div>
                </div>
                <div>
                  <h4 class="font-medium">John Doe</h4>
                  <span class="badge badge-success">En ligne</span>
                </div>
              </div>
              <p class="text-sm text-gray-600">
                Utilisateur test avec avatar et statut.
              </p>
            </div>
          </div>
        </div>

        <!-- Test des messages -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold">Messages Test</h3>
          </div>
          <div class="card-body space-y-4">
            <div class="flex justify-end">
              <div class="message-bubble message-sent">
                <p>Salut ! Comment ça va ?</p>
                <div class="message-time">Il y a 5 min</div>
              </div>
            </div>
            <div class="flex justify-start">
              <div class="message-bubble message-received">
                <p>Très bien merci ! Et toi ?</p>
                <div class="message-time">Il y a 3 min</div>
              </div>
            </div>
            <div class="flex justify-end">
              <div class="message-bubble message-sent">
                <p>Parfait ! 😊</p>
                <div class="message-time">À l'instant</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Test responsive -->
        <div class="mt-8 p-4 bg-white rounded-lg">
          <p class="text-center text-gray-600">
            Testez le responsive en redimensionnant la fenêtre ! 📱💻
          </p>
        </div>
      </div>
    </div>
  `,
})
export class TestTailwindComponent {}
