// Confetti Animation System
class ConfettiSystem {
  constructor() {
    this.container = document.getElementById('confetti-container');
    this.colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
      '#ffeaa7', '#dda0dd', '#98d8c8', '#ff9ff3',
      '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
      '#10ac84', '#ee5253', '#0abde3', '#feca57'
    ];
    this.isActive = false;
  }

  createConfettiPiece() {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    
    // Random properties
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const size = Math.random() * 8 + 6; // 6-14px
    const left = Math.random() * 100;
    const animationDuration = Math.random() * 2 + 2; // 2-4 seconds
    const delay = Math.random() * 2; // 0-2 seconds delay
    
    // Set styles
    piece.style.backgroundColor = color;
    piece.style.width = size + 'px';
    piece.style.height = size + 'px';
    piece.style.left = left + '%';
    piece.style.animationDuration = animationDuration + 's';
    piece.style.animationDelay = delay + 's';
    
    // Random shapes
    if (Math.random() > 0.5) {
      piece.style.borderRadius = '50%'; // Circle
    } else {
      piece.style.borderRadius = '2px'; // Square with rounded corners
    }
    
    // Add rotation variation
    const rotationSpeed = Math.random() * 360 + 180; // 180-540 degrees
    piece.style.setProperty('--rotation', rotationSpeed + 'deg');
    
    return piece;
  }

  burst(intensity = 50) {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Create multiple waves of confetti
    for (let wave = 0; wave < 3; wave++) {
      setTimeout(() => {
        for (let i = 0; i < intensity; i++) {
          const piece = this.createConfettiPiece();
          this.container.appendChild(piece);
          
          // Remove piece after animation
          setTimeout(() => {
            if (piece.parentNode) {
              piece.parentNode.removeChild(piece);
            }
          }, 5000);
        }
      }, wave * 200);
    }
    
    // Reset active state
    setTimeout(() => {
      this.isActive = false;
    }, 4000);
  }

  celebrate() {
    // Create a big celebration with sound effect simulation
    this.burst(80);
    
    // Add screen flash effect
    this.flashScreen();
    
    // Show celebration message
    this.showCelebrationMessage();
  }

  flashScreen() {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      z-index: 999;
      pointer-events: none;
      animation: flash 0.5s ease-out;
    `;
    
    // Add flash animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes flash {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
      document.body.removeChild(flash);
      document.head.removeChild(style);
    }, 500);
  }

  showCelebrationMessage() {
    const message = document.createElement('div');
    message.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        padding: 30px 50px;
        border-radius: 20px;
        font-size: 1.5rem;
        font-weight: bold;
        text-align: center;
        z-index: 1001;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: celebrationPop 2s ease-out forwards;
      ">
        🎉 Congratulations! 🎉<br>
        <span style="font-size: 1rem; opacity: 0.9;">All tasks completed!</span>
      </div>
    `;
    
    // Add celebration animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes celebrationPop {
        0% { 
          opacity: 0; 
          transform: translate(-50%, -50%) scale(0.5);
        }
        20% { 
          opacity: 1; 
          transform: translate(-50%, -50%) scale(1.1);
        }
        30% { 
          transform: translate(-50%, -50%) scale(1);
        }
        90% { 
          opacity: 1; 
          transform: translate(-50%, -50%) scale(1);
        }
        100% { 
          opacity: 0; 
          transform: translate(-50%, -50%) scale(0.8);
        }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      if (message.parentNode) {
        document.body.removeChild(message);
      }
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    }, 2000);
  }
}

// Initialize confetti system
const confetti = new ConfettiSystem();