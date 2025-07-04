import { StateCreator, create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CheckItem } from '~/types/check.item';
import { Country } from '~/types/country';
import { City } from '~/types/city';

// 회원가입 단계 정의
export enum SignupStep {
  EMAIL = 'email',
  TERMS = 'terms',
  FORM = 'form',
  PASSPORT = 'passport',
  FACE = 'face',
  RESULT = 'result',
}

// 이메일 인증 관련 데이터
interface EmailData {
  email: string;
  password: string;
  passwordConfirm: string;
  verificationCode: string;
  uuid: string;
  isEmailVerified: boolean;
  isCodeSent: boolean;
}

// 약관 동의 관련 데이터
interface TermsData {
  checkList: CheckItem[];
  isAllChecked: boolean;
  agreedTerms: string[]; // 동의한 약관 ID들
}

// 개인정보 폼 데이터
interface PersonalData {
  name: string;
  birth: string;
  passportNumber: string;
  country?: Country;
  countryIndex?: number;
  city?: City;
  cityIndex?: number;
}

// 여권 관련 데이터
interface PassportData {
  passportImage: string;
  ocrData: {
    ocr_fullName?: string;
    ocr_gender?: string;
    ocr_birthDate?: string;
    ocr_nationality?: string;
    ocr_number?: string;
    ocr_issueDate?: string;
    ocr_expireDate?: string;
  };
  isPassportVerified: boolean;
}

// 얼굴 인증 관련 데이터
interface FaceData {
  faceImage: string;
  isFaceVerified: boolean;
}

// 진행 상태 관리
interface ProgressData {
  currentStep: SignupStep;
  completedSteps: SignupStep[];
  totalSteps: number;
  isFlowCompleted: boolean;
}

// 에러 상태 관리
interface ErrorData {
  emailError?: string;
  passwordError?: string;
  formError?: string;
  passportError?: string;
  faceError?: string;
  generalError?: string;
}

interface SignupAction {
  // 이메일 관련 액션
  setEmailData: (data: Partial<EmailData>) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setPasswordConfirm: (passwordConfirm: string) => void;
  setVerificationCode: (code: string) => void;
  setUuid: (uuid: string) => void;
  setEmailVerified: (verified: boolean) => void;
  setCodeSent: (sent: boolean) => void;

  // 약관 관련 액션
  setTermsData: (data: Partial<TermsData>) => void;
  setCheckList: (checkList: CheckItem[]) => void;
  setAllChecked: (checked: boolean) => void;
  agreeToTerm: (termId: string) => void;
  disagreeToTerm: (termId: string) => void;

  // 개인정보 관련 액션
  setPersonalData: (data: Partial<PersonalData>) => void;
  setName: (name: string) => void;
  setBirth: (birth: string) => void;
  setPassportNumber: (number: string) => void;
  setCountry: (country: Country, index?: number) => void;
  setCity: (city: City, index?: number) => void;
  setCityIndex: (index: number) => void;
  setCountryIndex: (index: number) => void;
  
  // 여권 관련 액션
  setPassportData: (data: Partial<PassportData>) => void;
  setPassportImage: (image: string) => void;
  setOcrData: (ocrData: Partial<PassportData['ocrData']>) => void;
  setPassportVerified: (verified: boolean) => void;

  // 얼굴 인증 관련 액션
  setFaceData: (data: Partial<FaceData>) => void;
  setFaceImage: (image: string) => void;
  setFaceVerified: (verified: boolean) => void;

  // 진행 상태 관련 액션
  setCurrentStep: (step: SignupStep) => void;
  completeStep: (step: SignupStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetProgress: () => void;

  // 에러 관련 액션
  setError: (type: keyof ErrorData, error?: string) => void;
  clearErrors: () => void;
  clearAllErrors: () => void;

  // 전체 리셋
  resetSignupData: () => void;

  // 검증 헬퍼
  validateCurrentStep: () => boolean;
  getSignupProgress: () => number;
  
  // 데이터 가져오기 헬퍼
  getApiSignupParams: () => any;
}

interface SignupStore {
  emailData: EmailData;
  termsData: TermsData;
  personalData: PersonalData;
  passportData: PassportData;
  faceData: FaceData;
  progressData: ProgressData;
  errorData: ErrorData;
  action: SignupAction;
}

const initialEmailData: EmailData = {
  email: '',
  password: '',
  passwordConfirm: '',
  verificationCode: '',
  uuid: '',
  isEmailVerified: false,
  isCodeSent: false,
};

const initialTermsData: TermsData = {
  checkList: [],
  isAllChecked: false,
  agreedTerms: [],
};

const initialPersonalData: PersonalData = {
  name: '',
  birth: '',
  passportNumber: '',
  country: undefined,
  countryIndex: undefined,
  city: undefined,
  cityIndex: undefined,
};

const initialPassportData: PassportData = {
  passportImage: '',
  ocrData: {},
  isPassportVerified: false,
};

const initialFaceData: FaceData = {
  faceImage: '',
  isFaceVerified: false,
};

const initialProgressData: ProgressData = {
  currentStep: SignupStep.EMAIL,
  completedSteps: [],
  totalSteps: 6,
  isFlowCompleted: false,
};

const initialErrorData: ErrorData = {};

const initialValue: Omit<SignupStore, 'action'> = {
  emailData: initialEmailData,
  termsData: initialTermsData,
  personalData: initialPersonalData,
  passportData: initialPassportData,
  faceData: initialFaceData,
  progressData: initialProgressData,
  errorData: initialErrorData,
};

const stepOrder: SignupStep[] = [
  SignupStep.EMAIL,
  SignupStep.TERMS,
  SignupStep.FORM,
  SignupStep.PASSPORT,
  SignupStep.FACE,
  SignupStep.RESULT,
];

const useStore: StateCreator<SignupStore, [], []> = (set, get) => ({
  ...initialValue,
  action: {
    // 이메일 관련 액션
    setEmailData: (data) => {
      set((state) => ({
        emailData: { ...state.emailData, ...data },
      }));
    },
    setEmail: (email) => {
      set((state) => ({
        emailData: { ...state.emailData, email },
      }));
    },
    setPassword: (password) => {
      set((state) => ({
        emailData: { ...state.emailData, password },
      }));
    },
    setPasswordConfirm: (passwordConfirm) => {
      set((state) => ({
        emailData: { ...state.emailData, passwordConfirm },
      }));
    },
    setVerificationCode: (verificationCode) => {
      set((state) => ({
        emailData: { ...state.emailData, verificationCode },
      }));
    },
    setUuid: (uuid) => {
      set((state) => ({
        emailData: { ...state.emailData, uuid },
      }));
    },
    setEmailVerified: (isEmailVerified) => {
      set((state) => ({
        emailData: { ...state.emailData, isEmailVerified },
      }));
    },
    setCodeSent: (isCodeSent) => {
      set((state) => ({
        emailData: { ...state.emailData, isCodeSent },
      }));
    },

    // 약관 관련 액션
    setTermsData: (data) => {
      set((state) => ({
        termsData: { ...state.termsData, ...data },
      }));
    },
    setCheckList: (checkList) => {
      set((state) => ({
        termsData: { ...state.termsData, checkList },
      }));
    },
    setAllChecked: (isAllChecked) => {
      set((state) => ({
        termsData: { ...state.termsData, isAllChecked },
      }));
    },
    agreeToTerm: (termId) => {
      set((state) => ({
        termsData: {
          ...state.termsData,
          agreedTerms: [...state.termsData.agreedTerms.filter(id => id !== termId), termId],
        },
      }));
    },
    disagreeToTerm: (termId) => {
      set((state) => ({
        termsData: {
          ...state.termsData,
          agreedTerms: state.termsData.agreedTerms.filter(id => id !== termId),
        },
      }));
    },

    // 개인정보 관련 액션
    setPersonalData: (data) => {
      set((state) => ({
        personalData: { ...state.personalData, ...data },
      }));
    },
    setName: (name) => {
      set((state) => ({
        personalData: { ...state.personalData, name },
      }));
    },
    setBirth: (birth) => {
      set((state) => ({
        personalData: { ...state.personalData, birth },
      }));
    },
    setPassportNumber: (passportNumber) => {
      set((state) => ({
        personalData: { ...state.personalData, passportNumber },
      }));
    },
    setCountry: (country, countryIndex) => {
      set((state) => ({
        personalData: { ...state.personalData, country, countryIndex },
      }));
    },
    setCountryIndex: (countryIndex) => {
      set((state) => ({
        personalData: { ...state.personalData, countryIndex },
      }));
    },
    setCity: (city, cityIndex) => {
      set((state) => ({
        personalData: { ...state.personalData, city, cityIndex },
      }));
    },
    setCityIndex: (cityIndex) => {
      set((state) => ({
        personalData: { ...state.personalData, cityIndex },
      }));
    },

    // 여권 관련 액션
    setPassportData: (data) => {
      set((state) => ({
        passportData: { ...state.passportData, ...data },
      }));
    },
    setPassportImage: (passportImage) => {
      set((state) => ({
        passportData: { ...state.passportData, passportImage },
      }));
    },
    setOcrData: (ocrData) => {
      set((state) => ({
        passportData: {
          ...state.passportData,
          ocrData: { ...state.passportData.ocrData, ...ocrData },
        },
      }));
    },
    setPassportVerified: (isPassportVerified) => {
      set((state) => ({
        passportData: { ...state.passportData, isPassportVerified },
      }));
    },

    // 얼굴 인증 관련 액션
    setFaceData: (data) => {
      set((state) => ({
        faceData: { ...state.faceData, ...data },
      }));
    },
    setFaceImage: (faceImage) => {
      set((state) => ({
        faceData: { ...state.faceData, faceImage },
      }));
    },
    setFaceVerified: (isFaceVerified) => {
      set((state) => ({
        faceData: { ...state.faceData, isFaceVerified },
      }));
    },

    // 진행 상태 관련 액션
    setCurrentStep: (currentStep) => {
      set((state) => ({
        progressData: { ...state.progressData, currentStep },
      }));
    },
    completeStep: (step) => {
      set((state) => {
        const completedSteps = state.progressData.completedSteps.includes(step)
          ? state.progressData.completedSteps
          : [...state.progressData.completedSteps, step];

        return {
          progressData: {
            ...state.progressData,
            completedSteps,
            isFlowCompleted: completedSteps.length === state.progressData.totalSteps,
          },
        };
      });
    },
    goToNextStep: () => {
      const { currentStep } = get().progressData;
      const currentIndex = stepOrder.indexOf(currentStep);
      const nextIndex = Math.min(currentIndex + 1, stepOrder.length - 1);
      const nextStep = stepOrder[nextIndex];

      set((state) => ({
        progressData: { ...state.progressData, currentStep: nextStep },
      }));
    },
    goToPreviousStep: () => {
      const { currentStep } = get().progressData;
      const currentIndex = stepOrder.indexOf(currentStep);
      const prevIndex = Math.max(currentIndex - 1, 0);
      const prevStep = stepOrder[prevIndex];

      set((state) => ({
        progressData: { ...state.progressData, currentStep: prevStep },
      }));
    },
    resetProgress: () => {
      set((state) => ({
        progressData: initialProgressData,
      }));
    },

    // 에러 관련 액션
    setError: (type, error) => {
      set((state) => ({
        errorData: { ...state.errorData, [type]: error },
      }));
    },
    clearErrors: () => {
      set((state) => ({
        errorData: {},
      }));
    },
    clearAllErrors: () => {
      set({ errorData: {} });
    },

    // 전체 리셋
    resetSignupData: () => {
      set(initialValue);
    },

    // 검증 헬퍼
    validateCurrentStep: () => {
      const state = get();
      const { currentStep } = state.progressData;

      switch (currentStep) {
        case SignupStep.EMAIL:
          return !!(
            state.emailData.email &&
            state.emailData.password &&
            state.emailData.isEmailVerified
          );
        case SignupStep.TERMS:
          return state.termsData.checkList
            .filter(item => item.isMandatory)
            .every(item => item.isChecked);
        case SignupStep.FORM:
          return !!(
            state.personalData.name &&
            state.personalData.birth &&
            state.personalData.passportNumber &&
            state.personalData.country
          );
        case SignupStep.PASSPORT:
          return !!(state.passportData.passportImage && state.passportData.isPassportVerified);
        case SignupStep.FACE:
          return !!(state.faceData.faceImage && state.faceData.isFaceVerified);
        default:
          return true;
      }
    },

    getSignupProgress: () => {
      const { completedSteps, totalSteps } = get().progressData;
      return (completedSteps.length / totalSteps) * 100;
    },

    // API 파라미터 생성 헬퍼
    getApiSignupParams: () => {
      const state = get();
      return {
        uuid: state.emailData.uuid,
        email: state.emailData.email,
        password: state.emailData.password,
        passwordCheck: state.emailData.passwordConfirm,
        name: state.personalData.name,
        birthday: state.personalData.birth,
        countryCode: state.personalData.country?.code || '',
        cityId: state.personalData.city?.id || '',
        passportNumber: state.personalData.passportNumber,
        passportImageKey: '', // 업로드 후 받은 키 값
        profileImageKey: '', // 업로드 후 받은 키 값
      };
    },
  },
});

export const useSignup = __DEV__
  ? create<SignupStore>()(
      devtools(
        persist(useStore, {
          name: 'signup-storage',
          storage: {
            getItem: async (name) => {
              const value = await AsyncStorage.getItem(name);
              return value ? JSON.parse(value) : null;
            },
            setItem: async (name, value) => {
              await AsyncStorage.setItem(name, JSON.stringify(value));
            },
            removeItem: async (name) => {
              await AsyncStorage.removeItem(name);
            },
          },
          // 민감한 정보는 persist에서 제외
          partialize: (state) => ({
            personalData: state.personalData,
            progressData: state.progressData,
            // 비밀번호와 인증 정보는 제외
          }) as any,
        }),
        {
          anonymousActionType: 'signup',
          name: 'signup',
        }
      )
    )
  : create<SignupStore>()(
      persist(useStore, {
        name: 'signup-storage',
        storage: {
          getItem: async (name) => {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          },
          setItem: async (name, value) => {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: async (name) => {
            await AsyncStorage.removeItem(name);
          },
        },
        partialize: (state) => ({
          personalData: state.personalData,
          progressData: state.progressData,
        }) as any,
      })
    );

// 개별 데이터 선택자
export const useSignupEmailData = () =>
  useSignup(useShallow((state) => state.emailData));

export const useSignupTermsData = () =>
  useSignup(useShallow((state) => state.termsData));

export const useSignupPersonalData = () =>
  useSignup(useShallow((state) => state.personalData));

export const useSignupPassportData = () =>
  useSignup(useShallow((state) => state.passportData));

export const useSignupFaceData = () =>
  useSignup(useShallow((state) => state.faceData));

export const useSignupProgressData = () =>
  useSignup(useShallow((state) => state.progressData));

export const useSignupErrorData = () =>
  useSignup(useShallow((state) => state.errorData));

export const useSignupAction = () => 
  useSignup(useShallow((state) => state.action));

// 조합 선택자 (자주 함께 사용되는 데이터들)
export const useSignupFormData = () =>
  useSignup(
    useShallow((state) => ({
      email: state.emailData.email,
      password: state.emailData.password,
      name: state.personalData.name,
      birth: state.personalData.birth,
      country: state.personalData.country,
      passportNumber: state.personalData.passportNumber,
    }))
  );

export const useSignupProgress = () =>
  useSignup(
    useShallow((state) => ({
      currentStep: state.progressData.currentStep,
      progress: (state.progressData.completedSteps.length / state.progressData.totalSteps) * 100,
      isCompleted: state.progressData.isFlowCompleted,
    }))
  ); 