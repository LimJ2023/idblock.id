import React from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import { Application } from './src';

dayjs.locale('ko');

function App(): React.JSX.Element {
  return <Application />;
}

export default App;
