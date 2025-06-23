import React from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/en';

import { Application } from './src';

dayjs.locale('en');

function App(): React.JSX.Element {
  return <Application />;
}

export default App;
