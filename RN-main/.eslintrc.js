module.exports = {
  root: true,
  globals: {
    JSX: 'readonly',
    NodeJS: true,
  },
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'prettier'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-shadow': 'off',
        semi: 'off',
        '@typescript-eslint/no-shadow': ['error'],
        // 사용하지 않는 변수에 대한 설정
        'no-unused-vars': 'error',
        // react hooks 사용 시 에러 체크
        'react-hooks/rules-of-hooks': 'error',
        // 인라인 스타일 적용 허용
        'react-native/no-inline-styles': 0,
        // useEffect, useCallback 등 종속성을 가지는 훅에서 누락된 종속성을 알려줌
        'react-hooks/exhaustive-deps': 'off',
        'max-len': ['error', { code: 140 }],
        'prettier/prettier': 'warn',
        'react/jsx-key': 'error', // 반복문으로 생성하는 요소에 key 필수
      },
    },
  ],
};
