// Dummy Biometric Service for Demo
export type BiometricType = 'fingerprint' | 'face' | 'iris';

export interface AuthResult {
  success: boolean;
  error?: string;
  biometricType?: BiometricType;
}

export interface EnrollmentResult {
  success: boolean;
  error?: string;
}

export class BiometricService {
  private failedAttempts = 0;
  private readonly MAX_ATTEMPTS = 3;
  private isAccountLocked = false;
  private lockoutExpiry: Date | null = null;

  async isAvailable(): Promise<BiometricType[]> {
    // Simulate biometric hardware availability
    return ['fingerprint', 'face'];
  }

  async authenticate(reason: string): Promise<AuthResult> {
    // Check if account is locked
    if (this.isAccountLocked) {
      if (this.lockoutExpiry && new Date() < this.lockoutExpiry) {
        return {
          success: false,
          error: 'Account temporarily locked due to multiple failed attempts. Try again later.'
        };
      } else {
        // Unlock account after timeout
        this.isAccountLocked = false;
        this.lockoutExpiry = null;
        this.failedAttempts = 0;
      }
    }

    // Simulate biometric authentication (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      this.failedAttempts = 0;
      return {
        success: true,
        biometricType: 'fingerprint'
      };
    } else {
      this.failedAttempts++;
      
      if (this.failedAttempts >= this.MAX_ATTEMPTS) {
        this.isAccountLocked = true;
        this.lockoutExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
        
        // Simulate admin notification
        console.log('Admin notification: Account locked due to multiple biometric failures');
        
        return {
          success: false,
          error: 'Multiple authentication failures. Account has been temporarily locked.'
        };
      }

      return {
        success: false,
        error: 'Biometric authentication failed. Please try again.'
      };
    }
  }

  async enrollBiometric(): Promise<EnrollmentResult> {
    // Simulate biometric enrollment process
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true
        });
      }, 2000); // Simulate 2-second enrollment process
    });
  }

  async removeBiometric(): Promise<boolean> {
    // Simulate biometric removal
    return true;
  }

  // Fallback to PIN authentication
  async authenticateWithPIN(pin: string): Promise<AuthResult> {
    // Dummy PIN validation (accept "1234" for demo)
    if (pin === "1234") {
      return {
        success: true
      };
    }

    this.failedAttempts++;
    
    if (this.failedAttempts >= this.MAX_ATTEMPTS) {
      this.isAccountLocked = true;
      this.lockoutExpiry = new Date(Date.now() + 15 * 60 * 1000);
      
      return {
        success: false,
        error: 'Multiple authentication failures. Account has been temporarily locked.'
      };
    }

    return {
      success: false,
      error: 'Invalid PIN. Please try again.'
    };
  }

  // Check if biometric hardware is available
  async isBiometricAvailable(): boolean {
    const types = await this.isAvailable();
    return types.length > 0;
  }

  // Get remaining lockout time
  getRemainingLockoutTime(): number {
    if (!this.isAccountLocked || !this.lockoutExpiry) {
      return 0;
    }

    const remaining = this.lockoutExpiry.getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000)); // Return seconds
  }
}

// Singleton instance
export const biometricService = new BiometricService();