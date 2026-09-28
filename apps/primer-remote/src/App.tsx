import '@primer/primitives/dist/css/functional/themes/light.css'
import { BaseStyles } from '@primer/react'
import { ThemeProvider } from '@primer/react/next'

import "./App.css";

import HigherUncle from './pages/HigherUncle';

export default function App() {

  return (
    <ThemeProvider>
      <BaseStyles>
        <HigherUncle />
      </BaseStyles>
    </ThemeProvider>
  );
}
